import { Link } from 'react-router-dom'; 
import './Footer.css'
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

export default function(){

    return(
        <>
            <footer className="site-footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="navbar-logo">KainPrends</div>
                        <p>A place for home cooks to discover, save, and share real recipes.</p>
                    </div>

                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <Link to="/">Home</Link>
                        <Link to="/recipes">Recipes</Link>
                        <Link to="/about">About</Link>
                    </div>

                    <div className="footer-links">
                        <h4>Help</h4>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Use</Link>
                    </div>

                    <div className="footer-social">
                        <h4>Follow Us</h4>
                        <div className="footer-social-icons">
                            <a href="#" aria-label="Instagram"><FaInstagram size={18} /></a>
                            <a href="#" aria-label="Facebook"><FaFacebook size={18} /></a>
                            <a href="#" aria-label="Twitter"><FaTwitter size={18} /></a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 KainPrends. All rights reserved.</p>
                </div>
            </footer>
        </>
    )
}