import React, { useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import { useEffect } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";

const HomePage = () => {
  let [blogs, setBlogs] = useState(null);

  const fetchLatestBlogs = async () => {
    try {
      let {
        data: { blogs },
      } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs");
      setBlogs(blogs);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLatestBlogs();
  }, []);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blog */}
        <div className="w-full">
          <InPageNavigation
            routes={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs === null ? (
                <Loader />
              ) : (
                blogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      
                    >
                      <BlogPostCard content={blog} author={blog.author.personal_info}/>
                    </AnimationWrapper>
                  );
                })
              )}
            </>
            <h1>Trending blogs here</h1>
          </InPageNavigation>
        </div>

        {/* filters and trending blog */}
        <div></div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
