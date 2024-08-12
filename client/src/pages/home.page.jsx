import React from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigaiton from "../components/inpage-navigation.component";

const HomePage = () => {
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">

        {/* latest blog */}
        <div className="w-full">
          <InPageNavigaiton
            routes={["home", "trending blogs"]} defaultHidden={["trending blogs"]}
          >

            <h1>Latest blogs here</h1>
            <h1>Trending blogs here</h1>
          </InPageNavigaiton>
        </div>

        {/* filters and trending blog */}
        <div></div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
