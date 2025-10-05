import React from "react";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { ctaClicksState } from "../recoil/ctaState";
import ArrowIcon from "../assets/arrowIcon.png";

const CTA = ({ id, title, description, buttonText, onClick, to }) => {
  const [ctaState, setCtaState] = useRecoilState(ctaClicksState);

  const navigate = useNavigate();
  const handleClick = () => {
    setCtaState({ ...ctaState, [id]: true });
    if (onClick) onClick();

    if (to) {
      navigate(to);
    }
  };

  return (
    <div className="ctaBox__main_wrap">
      <div className="ctaBox__container">
        <h2 dangerouslySetInnerHTML={{ __html: title }} />
        <p dangerouslySetInnerHTML={{ __html: description }} />
        <button onClick={handleClick}>
          {buttonText} <img src={ArrowIcon} alt="ArrowIcon" />
        </button>
      </div>
    </div>
  );
};

export default CTA;
