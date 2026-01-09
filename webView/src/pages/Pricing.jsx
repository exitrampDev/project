import Footer from "../components/Footer";
import Header from "../components/Header";
import PricingpageHero from "../components/pricingpage/PricingpageHero";
import PricingCards from "../components/pricingpage/PricingCards";
import PricingFeaturesTable from "../components/pricingpage/PricingFeaturesTable";



const PricingPage = () =>{
    return(<>
    <Header/>
    <PricingpageHero />
      <PricingCards />
      <PricingFeaturesTable />
    <Footer/>
    </>)
}
export default PricingPage;