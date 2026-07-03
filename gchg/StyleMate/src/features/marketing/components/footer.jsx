const Footer = () => {
  return (
    <footer className="bg-primary text-white/80 py-12">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-bold text-lg mb-3">StyleMate</h4>
          <p className="text-sm">
            Revolutionizing the way you dress. Your personal digital stylist,
            always in your pocket.
          </p>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3">Product</h5>
          <ul className="space-y-2 text-sm">
            <li>Features</li>
            <li>Pricing</li>
            <li>AI Style Engine</li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3">Company</h5>
          <ul className="space-y-2 text-sm">
            <li>About Us</li>
            <li>Blog</li>
            <li>Careers</li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3">Subscribe</h5>
          <p className="text-sm">Get the latest styling tips directly.</p>
        </div>
      </div>
      <p className="text-center text-xs mt-10">© 2026 StyleMate. All rights reserved.</p>
    </footer>
  );
};

export default Footer;