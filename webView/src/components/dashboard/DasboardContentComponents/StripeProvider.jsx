import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51SXzJMGhVrxnC7SP8OZVq1SLxgjAZ4aDdBf43I1WyRsicyfB3ONFuwImOW9LVr2XFZPG11Yf0v3OWvtDKmQeuW62004rbhpFeQ"
);

const StripeProvider = ({ clientSecret, children }) => {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
