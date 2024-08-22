import React, { useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation, {
  activeTabRef,
} from "../components/inpage-navigation.component";
import axios from "axios";
import { useEffect } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

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

  const fetchLatestBlogs = async ({ page }) => {
    try {
      let {
        data: { blogs: apiBlogs },
      } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs",
        { page }
      );

      let formatedData = await filterPaginationData({
        state: blogs,
        data: apiBlogs,
        page,
        countRoute: "/all-latest-blogs-count",
      });

      setBlogs(formatedData);
      console.log(blogs);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBlogsByCategory = async ({ page }) => {
    try {
      let {
        data: { blogs: apiBlogs },
      } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
        { tag: pageState, page }
      );

      let formatedData = await filterPaginationData({
        state: blogs,
        data: apiBlogs,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { tag: pageState },
      });

      setBlogs(formatedData);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTrendingtBlogs = async () => {
    try {
      let {
        data: { blogs: apiBlogs },
      } = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs"
      );
      setTrendingBlogs(apiBlogs);
    } catch (err) {
      console.log(err);
    }
  };

  const loadBlogByCategory = (e) => {
    console.log("entered loadblogbycategory");

    let category = e.target.innerText.toLowerCase();
    console.log("entered loadblogbycategory 2");

    setBlogs(null);

    console.log(blogs);

    if (pageState == category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });

    } else {
      fetchBlogsByCategory({ page: 1 });

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
              ) : blogs.results.length ? (
                blogs.results.map((blog, i) => {
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
              ) : (
                <NoDataMessage message="No blogs published" />
              )}

              <LoadMoreDataBtn
                state={blogs}
                fetchDataFunction={
                  pageState === "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>

            {trendingBlogs === null ? (
              <Loader />
            ) : trendingBlogs.length ? (
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
            ) : (
              <NoDataMessage message="No Trending blogs" />
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
            ) : trendingBlogs.length ? (
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
            ) : (
              <NoDataMessage message="No blogs published" />
            )}
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
