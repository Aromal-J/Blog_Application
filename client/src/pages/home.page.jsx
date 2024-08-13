import React, { useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation, { activeTabRef } from "../components/inpage-navigation.component";
import axios from "axios";
import { useEffect } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";

const HomePage = () => {
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");

  let categories = [
    "programming",
    "hollywood",
    "film making",
    "cooking",
    "tech",
    "social media",
    "finances",
  ];

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

  const fetchTrendingtBlogs = async () => {
    try {
      let {
        data: { blogs },
      } = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs"
      );
      setTrendingBlogs(blogs);
    } catch (err) {
      console.log(err);
    }
  };

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();
    setBlogs(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  useEffect(() => {

    activeTabRef.current.click()

    if (pageState === "home") {
      fetchLatestBlogs();
    }

    if (!trendingBlogs) {
      fetchTrendingtBlogs();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blog */}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
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
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              )}
            </>

            {trendingBlogs === null ? (
              <Loader />
            ) : (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    key={i}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            )}
          </InPageNavigation>
        </div>

        {/* filters and trending blog */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-5 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories from all interests
              </h1>

              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => {
                  return (
                    <button
                      key={i}
                      className={
                        "tag " +
                        (pageState == category ? "bg-black text-white" : " ")
                      }
                      onClick={loadBlogByCategory}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <h1 className="font-medium text-xl mb-8">
              Trending <i className="fi fi-rr-arrow-trend-up"></i>
            </h1>

            {trendingBlogs === null ? (
              <Loader />
            ) : (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    key={i}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            )}
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
