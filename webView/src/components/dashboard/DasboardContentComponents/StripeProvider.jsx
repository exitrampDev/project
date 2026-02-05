import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51RaBBDIZVmJBLRE4JCnzatrXn34mX81yfddRAFA7Cgl6KegNr3j1heGKU0ZCj133AMS1WDKcOaeFj62FeRWDuxMr00ncqX50QJ"
);

const StripeProvider = ({ clientSecret, children }) => {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
