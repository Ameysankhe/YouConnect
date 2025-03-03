import React from "react";
import "../styles/QuickTubeBanner.css";
import GetStartedButton from './GetStartedButton';

const QuickTubeBanner = () => {
  return (
    <div className="quicktube-banner">
      <h4>
        Introducing <span className="hashtag">#YouConnect</span>
      </h4>
      <p>
        Accelerating your YouTube journey with Instant solutions
        <br />
        and Endless Possibilities
      </p>
      <GetStartedButton/>
    </div>
  );
};

export default QuickTubeBanner;
