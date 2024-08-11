import { Link } from "react-router-dom";
import logo from "../images/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../images/blog banner.png";
import { uploadImage } from "../common/aws";
import { useContext, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";

const BlogEditor = () => {
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    editorState,
    setEditorState,
    textEditor,
    setTextEditor,
  } = useContext(EditorContext);

  useEffect(() => {
    setTextEditor(
      new EditorJS({
        holder: "textEditor",
        data: content,
        tools: tools,
        placeholder: "Let's write an awesome story",
      })
    );
  }, []);

  const handleBannerUpload = (e) => {
    let img = e.target.files[0];
    // console.log(img);

    if (img) {
      let loadingToast = toast.loading("Uploading...");
      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded");

            setBlog({ ...blog, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err);
        });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  const handleBannerError = (e) => {
    let img = e.target;
    // console.log(img);
    img.src = defaultBanner;
  };

  const handlePublishEvent=()=>{

    // if(!banner.length){
    //   return toast.error("Please upload a blog banner to publish it")
    // }

    // if(!title.length){
    //   return toast.error("Write blog title to publish it")
    // }

    if(textEditor.isReady){
      textEditor.save().then(data=>{
       if(data.blocks.length){
        setBlog({...blog, content:data})
        setEditorState("Publish")
       }else{
        setEditorState("Publish")

        // return toast.error("Write something in your blog to publish")
       }
      }).catch(err=>{
        console.log(err);
      })
    }

  }

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2 " onClick={handlePublishEvent}>Publish</button>
          <button className="btn-light py-2">Save Draft</button>
        </div>
      </nav>
      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner}
                  className="z-20"
                  onError={handleBannerError}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png,.jgp, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-24 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 overflow-hidden"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </div>
  );
};
export default BlogEditor;
