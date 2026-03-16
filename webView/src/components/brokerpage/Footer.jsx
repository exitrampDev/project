import footerLogo from "../../assets/footerLogo.png";
import Facebook from "../../assets/Facebook.png";
import Linkedin from "../../assets/Linkedin.png";


const Footer = () => { 
  return (
    <footer className="footer__section_broker_page_container">
        <div className="footer__logo_box">
            <img src={footerLogo} alt="Exit Ramp Logo" />
            <ul>
                <li><a href=""><img src={Facebook} alt="Facebook" /></a></li>
                <li><a href=""><img src={Linkedin} alt="LinkedIn" /></a></li>
            </ul>
        </div>
        <div className="footer__content">
            <p>© Exit Ramp {new Date().getFullYear()}. All Rights Reserved.</p>
            <p>Built for serious business buyers, sellers, and M&A professionals.</p>
        </div>
    </footer>
  );
};

export default Footer;