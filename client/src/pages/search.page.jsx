import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";

const SearchPage = () => {
  let { query } = useParams();
  let [blogs, setBlogs] = useState(null);

  const searchBlogs = async ({ page , create_new_arr = false }) => {
    try {
      let {
        data: { blogs: apiBlogs },
      } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        query,
        page,
      });

      let formatedData = await filterPaginationData({
        state: blogs,
        data: apiBlogs,
        page,
        countRoute: "/all-latest-blogs-count",
        data_to_send: { query },
        create_new_arr,
      });

      setBlogs(formatedData)
    } catch (err) {
        console.log(err);
        
    }
  };

  const resetState=()=>{
    setBlogs(null)
  }

  useEffect(()=>{
    resetState();
    searchBlogs({page:1, create_new_arr: true})

  },[query])

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search results from "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
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
              fetchDataFunction={searchBlogs}
            />
          </>
        </InPageNavigation>
      </div>
    </section>
  );
};

export default SearchPage;
