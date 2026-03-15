import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <h1 className="text-5xl font-serif mb-8">Our Story</h1>
        <p className="text-stone-500 leading-relaxed text-lg italic">
          "Elegance is the only beauty that never fades." — Audrey Hepburn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-32">
        <div className="aspect-[4/5] bg-stone-100 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80" 
            alt="Boutique Interior" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-8">
          <h2 className="text-3xl font-serif">The Luxe Boutique Vision</h2>
          <p className="text-stone-600 leading-relaxed">
            Founded in 2024, Luxe Boutique was born out of a passion for timeless elegance and modest fashion. 
            We believe that clothing is more than just fabric; it's an expression of identity, grace, and confidence.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Our collections are curated with a focus on premium materials, intricate craftsmanship, and contemporary 
            designs that respect traditional values. From flowing silk maxis to hand-embroidered abayas, 
            every piece in our boutique is chosen to make you feel extraordinary.
          </p>
          <div className="pt-8 border-t border-stone-100">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-2xl font-serif mb-1">10k+</p>
                <p className="text-xs uppercase tracking-widest text-stone-400 font-bold">Happy Clients</p>
              </div>
              <div>
                <p className="text-2xl font-serif mb-1">500+</p>
                <p className="text-xs uppercase tracking-widest text-stone-400 font-bold">Unique Designs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-stone-900 text-white rounded-3xl p-12 md:p-20 text-center">
        <h2 className="text-3xl font-serif mb-8">Our Commitment to Quality</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-lg font-serif">Premium Fabrics</h3>
            <p className="text-stone-400 text-sm leading-relaxed">We source only the finest silks, linens, and velvets from around the world.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-serif">Ethical Craft</h3>
            <p className="text-stone-400 text-sm leading-relaxed">Every garment is produced in small batches with fair labor practices.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-serif">Timeless Design</h3>
            <p className="text-stone-400 text-sm leading-relaxed">We create pieces that transcend trends and remain staples in your wardrobe.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
