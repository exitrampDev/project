import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  "pk_test_51QBRQ5JDeawSozVYYetn3ZwJ7oyQsJpprPWoRtSGv37ndasqmuYQ35aFoYB9LdByEZBvJ9IX1AWBkIUQu4h7406200GGssAuxS"
);

const StripeProvider = ({ clientSecret, children }) => {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
