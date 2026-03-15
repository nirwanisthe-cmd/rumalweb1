import { collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { slugify } from './utils';

export const ensureAdminUser = async () => {
  const adminEmail = 'rumalfernando@luxeboutique.lk'.toLowerCase();
  const adminPassword = 'WelCome./@1';

  try {
    // Try to create the user in Auth
    let uid: string;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      uid = userCredential.user.uid;
      console.log('Admin user created in Auth:', uid);
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') {
        // User already exists in Auth, we need their UID
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        uid = userCredential.user.uid;
        console.log('Admin user already exists in Auth, signed in to get UID:', uid);
      } else {
        throw authError;
      }
    }

    // Create or update the user document in Firestore
    await setDoc(doc(db, 'users', uid), {
      email: adminEmail,
      role: 'admin',
      name: 'Rumal Fernando',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    console.log('Admin user document ensured in Firestore for UID:', uid);
  } catch (error) {
    console.error('Error ensuring admin user:', error);
    throw error;
  }
};

export const deleteProducts = async () => {
  try {
    console.log('Deleting all products...');
    const snap = await getDocs(collection(db, 'products'));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'products', d.id));
    }
    console.log('All products deleted.');
  } catch (error) {
    console.error('Error deleting products:', error);
    throw error;
  }
};

export const seedData = async () => {
  try {
    console.log('Starting seeding process...');
    
    // 1. Ensure Categories exist
    const catSnap = await getDocs(collection(db, 'categories'));
    let catIds: Record<string, string> = {};
    
    const categoryTemplates = [
      { name: 'Dresses', slug: 'dresses', featured: true, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80' },
      { name: 'Abayas', slug: 'abayas', featured: true, image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80' },
      { name: 'Modest Wear', slug: 'modest-wear', featured: true, image: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80' },
      { name: 'Plus Size', slug: 'plus-size', featured: false, image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&q=80' },
    ];

    // Map existing categories
    catSnap.forEach(doc => {
      const data = doc.data();
      const slug = data.slug || slugify(data.name || '');
      catIds[slug] = doc.id;
    });

    // Create missing categories
    for (const cat of categoryTemplates) {
      if (!catIds[cat.slug]) {
        console.log(`Creating missing category: ${cat.name}`);
        const docRef = await addDoc(collection(db, 'categories'), { 
          ...cat, 
          createdAt: new Date().toISOString() 
        });
        catIds[cat.slug] = docRef.id;
      }
    }

    // 2. Clear existing sample products to avoid duplicates
    console.log('Clearing existing sample products...');
    const existingSamplesQuery = query(collection(db, 'products'), where('tags', 'array-contains', 'sample'));
    const existingSamplesSnap = await getDocs(existingSamplesQuery);
    for (const d of existingSamplesSnap.docs) {
      await deleteDoc(doc(db, 'products', d.id));
    }

    // 3. Seed Products
    console.log('Seeding 20 products...');
    const productTemplates = [
      { name: 'Midnight Silk Maxi Dress', price: 12500, category: 'dresses', image: 'https://images.unsplash.com/photo-1539008835279-4346938827a6' },
      { name: 'Embroidered Velvet Abaya', price: 18000, category: 'abayas', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03' },
      { name: 'Linen Blend Modest Tunic', price: 6500, category: 'modest-wear', image: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95' },
      { name: 'Floral Print Chiffon Dress', price: 9800, category: 'dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8' },
      { name: 'Classic Black Abaya', price: 12000, category: 'abayas', image: 'https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f' },
      { name: 'Boho Chic Maxi', price: 8500, category: 'dresses', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446' },
      { name: 'Satin Evening Gown', price: 22000, category: 'dresses', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae' },
      { name: 'Casual Cotton Kurti', price: 4500, category: 'modest-wear', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03' },
      { name: 'Royal Blue Kaftan', price: 15500, category: 'abayas', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03' },
      { name: 'Summer Breeze Sundress', price: 7200, category: 'dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8' },
      { name: 'Elegant Lace Abaya', price: 19500, category: 'abayas', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03' },
      { name: 'Minimalist Shift Dress', price: 6800, category: 'dresses', image: 'https://images.unsplash.com/photo-1539008835279-4346938827a6' },
      { name: 'Pleated Midi Skirt', price: 5400, category: 'modest-wear', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee' },
      { name: 'Silk Wrap Dress', price: 14000, category: 'dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8' },
      { name: 'Modern Kimono Abaya', price: 16500, category: 'abayas', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03' },
      { name: 'Velvet Party Dress', price: 11000, category: 'dresses', image: 'https://images.unsplash.com/photo-1539008835279-4346938827a6' },
      { name: 'Denim Modest Jacket', price: 8900, category: 'modest-wear', image: 'https://images.unsplash.com/photo-1544441893-675973e31985' },
      { name: 'Gold Thread Abaya', price: 25000, category: 'abayas', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03' },
      { name: 'Polka Dot Retro Dress', price: 7800, category: 'dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8' },
      { name: 'Luxury Chiffon Hijab Set', price: 3500, category: 'modest-wear', image: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95' },
    ];

    for (const p of productTemplates) {
      const categoryId = catIds[p.category] || Object.values(catIds)[0];
      if (!categoryId) {
        console.warn(`Skipping product ${p.name} as no category was found.`);
        continue;
      }

      await addDoc(collection(db, 'products'), {
        name: p.name,
        price: p.price,
        categoryId: categoryId,
        featuredImage: `${p.image}?auto=format&fit=crop&q=80`,
        images: [`${p.image}?auto=format&fit=crop&q=80`],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
        colors: ['Black', 'White', 'Red', 'Blue', 'Green', 'Nude', 'Gold'],
        stock: Math.floor(Math.random() * 50) + 10,
        status: 'published',
        featured: Math.random() > 0.5,
        newArrival: true,
        shortDescription: `A beautiful ${p.name.toLowerCase()} for your collection.`,
        description: `This ${p.name} is designed with premium materials to ensure both comfort and style. Perfect for any occasion.`,
        slug: slugify(p.name) + '-' + Math.floor(Math.random() * 1000),
        sku: `LX-${Math.floor(1000 + Math.random() * 9000)}`,
        tags: ['fashion', 'luxury', 'sample'],
        ratingAverage: 4.5,
        reviewCount: Math.floor(Math.random() * 20),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 4. Banners (only if none exist)
    const bannerSnap = await getDocs(collection(db, 'banners'));
    if (bannerSnap.empty) {
      const banners = [
        {
          title: 'Ramadan Collection 2026',
          subtitle: 'Discover elegance in our latest modest wear and abayas.',
          imageDesktop: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80',
          imageMobile: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80',
          buttonText: 'Shop Now',
          buttonLink: '/shop/abayas',
          active: true,
          order: 1,
          createdAt: new Date().toISOString(),
        }
      ];
      for (const b of banners) {
        await addDoc(collection(db, 'banners'), b);
      }
    }

    // 5. Settings (only if none exist)
    const settingsSnap = await getDoc(doc(db, 'settings', 'store'));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, 'settings', 'store'), {
        storeName: 'Luxe Boutique',
        logo: '',
        email: 'hello@luxeboutique.lk',
        phone: '+94 11 234 5678',
        whatsapp: '+94 77 123 4567',
        address: '123 Fashion Ave, Colombo 07, Sri Lanka',
        currency: 'LKR',
        deliveryFee: 500,
        bankTransferInstructions: 'Bank: Commercial Bank\nAcc Name: Luxe Boutique\nAcc No: 1234567890',
        footerText: '© 2026 Luxe Boutique. All rights reserved.',
        createdAt: new Date().toISOString(),
      });
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

