'use server'

import sql from "@/lib/postgres";
import { put, del } from "@vercel/blob";
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from "@/lib/auth-check";

export async function GetProductAction({ searchQuery, sort, limit = 10, offset = 0 } = {}) {
    await requireAdmin();

    const result = await sql.begin(async sql => {
        const products = await sql`
        SELECT 
            p.id,
            p.name,
            p.description,
            p.stock,
            p.category_id,
            c.name AS category_name,
            p.price_type,
            f.price,
            (
                SELECT json_agg(json_build_object('min_quantity', w.min_quantity, 'max_quantity', w.max_quantity, 'price', w.price))
                FROM wholesale_prices w
                WHERE w.product_id = p.id
            ) AS wholesale_prices,
            (
                SELECT json_agg(pi.image_path)
                FROM product_images pi
                WHERE pi.product_id = p.id
            ) AS images,
            p.created_at
        FROM 
            products p
        LEFT JOIN 
            fixed_prices f ON p.id = f.product_id AND p.price_type = 'fixed'
        LEFT JOIN 
            categories c ON p.category_id = c.id
        ${searchQuery ? sql`WHERE p.name ILIKE ${'%' + searchQuery + '%'} 
            OR p.description ILIKE ${'%' + searchQuery + '%'} 
            OR c.name ILIKE ${'%' + searchQuery + '%'}` : sql``}
        ${sort === 'A-Z' ? sql`ORDER BY p.name ASC` : sql``}
        ${sort === 'Z-A' ? sql`ORDER BY p.name DESC` : sql``}
        ${sort === 'Newest' ? sql`ORDER BY p.created_at DESC` : sql``}
        ${sort === 'Oldest' ? sql`ORDER BY p.created_at ASC` : sql``}
        LIMIT ${limit} OFFSET ${offset}
    `;

        console.log("Query result:", products);
        return products;
    });

    return result;
}

export async function GetProductByIdAction(product_id) {
    await requireAdmin();
    const data = product_id;

    // Query untuk mendapatkan data produk berdasarkan kategori yang sesuai dengan query
    const result = await sql`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.stock,
                p.category_id,
                c.name AS category_name,
                p.created_at,
                p.price_type,
                f.price AS fixed_price,
                (
                    SELECT json_agg(json_build_object('min_quantity', w.min_quantity, 'max_quantity', w.max_quantity, 'price', w.price))
                    FROM wholesale_prices w
                    WHERE w.product_id = p.id
                ) AS wholesale_prices,
                (
                    SELECT json_agg(pi.image_path)
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                ) AS images
            FROM 
                products p
            LEFT JOIN 
                fixed_prices f ON p.id = f.product_id AND p.price_type = 'fixed'
            LEFT JOIN 
                categories c ON p.category_id = c.id
            WHERE 
                p.id = ${data};
        `;

    return result;
}

export async function DeleteProductAction(product_id) {
    await requireAdmin();
    try {
        const result = await sql.begin(async sql => {
            // 1. Get product info first
            const [product] = await sql`
                SELECT price_type FROM products WHERE id = ${product_id}
            `;

            if (!product) {
                throw new Error("Product not found");
            }

            // 2. Get and handle images
            const product_images = await sql`
                SELECT image_path FROM product_images WHERE product_id = ${product_id}
            `;

            // 3. Delete from storage if there are images
            if (product_images && product_images.length > 0) {
                const imagePaths = product_images.map(img => img.image_path);
                console.log("Images to delete:", imagePaths);

                if (imagePaths.length > 0) {
                    try {
                        await del(imagePaths);
                    } catch (error) {
                        console.error('Error removing images from blob:', error);
                    }
                }
            }

            // 4. Delete related data in correct order
            await sql`DELETE FROM product_images WHERE product_id = ${product_id}`;

            if (product.price_type === 'fixed') {
                await sql`DELETE FROM fixed_prices WHERE product_id = ${product_id}`;
            } else if (product.price_type === 'wholesale') {
                await sql`DELETE FROM wholesale_prices WHERE product_id = ${product_id}`;
            }

            // 5. Finally delete the product
            const [deletedProduct] = await sql`
                DELETE FROM products 
                WHERE id = ${product_id} 
                RETURNING *
            `;

            return deletedProduct;
        });

        return { result };
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error(`Failed to delete product: ${error.message}`);
    }
}

export async function InsertProductAction(formData) {
    await requireAdmin();
    const name = formData.get('name');
    const description = formData.get('description');
    const stock = formData.get('stock');
    const fixed_price = formData.get('fixed_price');
    const price_type = formData.get('price_type');
    const category = JSON.parse(formData.get('category') || '{}');
    const category_id = category.id || category.category_id;
    const category_name = category.name;
    const product_images = formData.getAll('product_images');
    const wholesalePrices = JSON.parse(formData.get('wholesalePrices') || 'null');

    try {
        // Validasi data
        if (!name) {
            throw new Error("Nama produk harus diisi.");
        }
        if (!description) {
            throw new Error("Deskripsi produk harus diisi.");
        }
        if (!stock) {
            throw new Error("Stok harus diisi.");
        }
        if (!category_id) {
            throw new Error("Kategori harus diisi.");
        }
        if (!name) {
            throw new Error("Nama Kategori harus diisi")
        }
        if (!price_type) {
            throw new Error("Tipe harga harus diisi.");
        }

        if (price_type === 'fixed' && !fixed_price) {
            throw new Error("Harga tetap harus diisi jika tipe harga adalah fixed.");
        }

        let product;
        const result = await sql.begin(async sql => {
            // Insert ke tabel products
            [product] = await sql`
                INSERT INTO products (
                    name, 
                    description, 
                    stock, 
                    category_id,
                    price_type
                ) VALUES (
                    ${name}, 
                    ${description}, 
                    ${stock}, 
                    ${category_id},
                    ${price_type}
                )
                RETURNING *;
            `;

            // Handle fixed price
            if (price_type === 'fixed') {
                await sql`
                    INSERT INTO fixed_prices (
                        product_id, 
                        price
                    ) VALUES (
                        ${product.id}, 
                        ${fixed_price}
                    );
                `;
            }

            // Handle wholesale prices
            if (price_type === 'wholesale' && wholesalePrices) {
                for (const wholesalePrice of wholesalePrices) {
                    await sql`
                        INSERT INTO wholesale_prices (
                            product_id, 
                            min_quantity, 
                            max_quantity, 
                            price
                        ) VALUES (
                            ${product.id}, 
                            ${wholesalePrice.min_quantity}, 
                            ${wholesalePrice.max_quantity}, 
                            ${wholesalePrice.price}
                        );
                    `;
                }
            }

            // Handle images
            if (product_images && product_images.length > 0) {
                for (const image of product_images) {
                    if (image && image.name) {
                        const fileName = `${uuidv4()}.${image.name.split('.').pop()}`;
                        
                        const blob = await put(`product_images/${fileName}`, image, {
                            access: 'public',
                        });

                        const imagePath = blob.url;
                        
                        await sql`
                            INSERT INTO product_images (
                                product_id, 
                                image_path
                            ) VALUES (
                                ${product.id}, 
                                ${imagePath}
                            );
                        `;
                    }
                }
            }

            return product;
        });

        return result;
    } catch (error) {
        console.error("Error inserting product:", error);
        return { error: error.message }; // Mengembalikan pesan error saja
    }
}



export async function UpdateProductAction(product_id, formData) {
    await requireAdmin();
    try {
        const name = formData.get('name');
        const description = formData.get('description');
        const stock = formData.get('stock');
        const price_type = formData.get('price_type');
        const fixed_price = formData.get('fixed_price');
        const category = JSON.parse(formData.get('category'));
        const wholesalePrices = JSON.parse(formData.get('wholesalePrices'));
        const product_images = formData.getAll('product_images');

        // Validasi data
        if (!name) {
            throw new Error("Nama produk harus diisi.");
        }
        if (!description) {
            throw new Error("Deskripsi produk harus diisi.");
        }
        if (!stock) {
            throw new Error("Stok harus diisi.");
        }
        if (!price_type) {
            throw new Error("Tipe harga harus diisi.");
        }
        if (!category || !(category.id || category.category_id)) {
            throw new Error("Kategori harus diisi.");
        }

        if (price_type === 'fixed' && !fixed_price) {
            throw new Error("Harga tetap harus diisi jika tipe harga adalah fixed.");
        }

        const result = await sql.begin(async sql => {
            // Cek apakah produk ada
            const [existingProduct] = await sql`
                SELECT id FROM products WHERE id = ${product_id}
            `;

            if (!existingProduct) {
                throw new Error("Produk yang akan di update tidak ditemukan.");
            }

            // Update produk utama
            const [updatedProduct] = await sql`
                UPDATE products 
                SET 
                    name = ${name},
                    description = ${description},
                    stock = ${stock},
                    price_type = ${price_type},
                    category_id = ${category.id || category.category_id}
                WHERE id = ${product_id}
                RETURNING *
            `;

            if (!updatedProduct) {
                throw new Error("Gagal memperbarui produk.");
            }

            // Handle harga berdasarkan price_type
            if (price_type === 'fixed') {
                // Hapus harga grosir jika ada
                await sql`DELETE FROM wholesale_prices WHERE product_id = ${product_id}`;

                // Update atau insert harga tetap
                const [existingFixedPrice] = await sql`SELECT product_id FROM fixed_prices WHERE product_id = ${product_id}`;
                if (existingFixedPrice) {
                    await sql`
                        UPDATE fixed_prices SET price = ${fixed_price} WHERE product_id = ${product_id}
                    `;
                } else {
                    await sql`
                        INSERT INTO fixed_prices (product_id, price) VALUES (${product_id}, ${fixed_price})
                    `;
                }
            } else if (price_type === 'wholesale') {
                // Hapus harga tetap jika ada
                await sql`DELETE FROM fixed_prices WHERE product_id = ${product_id}`;

                // Hapus harga grosir yang lama
                await sql`DELETE FROM wholesale_prices WHERE product_id = ${product_id}`;

                // Insert harga grosir baru
                if (wholesalePrices && wholesalePrices.length > 0) {
                    for (const price of wholesalePrices) {
                        await sql`
                            INSERT INTO wholesale_prices (
                                product_id, 
                                min_quantity, 
                                max_quantity, 
                                price
                            ) VALUES (
                                ${product_id}, 
                                ${price.min_quantity}, 
                                ${price.max_quantity}, 
                                ${price.price}
                            )
                        `;
                    }
                }
            }
            // Handle images
            const existing_images_from_form = formData.getAll('existing_images') || [];
            
            // Get current images from DB
            const currentImages = await sql`
                SELECT image_path FROM product_images WHERE product_id = ${product_id}
            `;

            // Find images to delete
            const imagesToDelete = currentImages
                .map(img => img.image_path)
                .filter(path => !existing_images_from_form.includes(path));

            // Delete from storage and DB
            if (imagesToDelete.length > 0) {
                try {
                    await del(imagesToDelete);
                } catch (error) {
                    console.error('Error removing images from blob:', error);
                }
                
                for (const path of imagesToDelete) {
                    await sql`DELETE FROM product_images WHERE product_id = ${product_id} AND image_path = ${path}`;
                }
            }

            // Upload and insert new images
            if (product_images && product_images.length > 0) {
                for (const image of product_images) {
                    if (image && image.name) {
                        const fileName = `${uuidv4()}.${image.name.split('.').pop()}`;
                        
                        const blob = await put(`product_images/${fileName}`, image, {
                            access: 'public',
                        });

                        const imagePath = blob.url;
                        
                        await sql`
                            INSERT INTO product_images (
                                product_id, 
                                image_path
                            ) VALUES (
                                ${product_id}, 
                                ${imagePath}
                            )
                        `;
                    }
                }
            }

            // Ambil data produk yang sudah diupdate
            const [result] = await sql`
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.stock,
                    p.category_id,
                    c.name AS category_name,
                    p.price_type,
                    f.price,
                    (
                        SELECT json_agg(json_build_object('min_quantity', w.min_quantity, 'max_quantity', w.max_quantity, 'price', w.price))
                        FROM wholesale_prices w
                        WHERE w.product_id = p.id
                    ) AS wholesale_prices,
                    (
                        SELECT json_agg(pi.image_path)
                        FROM product_images pi
                        WHERE pi.product_id = p.id
                    ) AS images
                FROM 
                    products p
                LEFT JOIN 
                    fixed_prices f ON p.id = f.product_id AND p.price_type = 'fixed'
                LEFT JOIN 
                    categories c ON p.category_id = c.id
                WHERE p.id = ${product_id};
            `;

            return result;
        });

        return result;
    } catch (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }
}
