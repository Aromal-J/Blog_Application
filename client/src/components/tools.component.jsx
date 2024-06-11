import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
import InlineCode from "@editorjs/inline-code";
import { uploadImage } from "../common/aws";


const uploadImageByUrl=(e)=>{
    let link = new Promise((resolve, reject)=>{
        try {
            resolve(e)
        } catch (err) {
            reject(err)
        }
    })

    return link.then(url=>{
        return{
            success:1,
            file:{url}
        }
    })
}

const uploadImageByFile=(e)=>{
    return uploadImage(e).then(url=>{
        if(url){
            return {
                success:1,
                file:{url}
            }
        }
    })
}


export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type heading...",
      levels: [1, 2, 3],
      default: 2,
    },
  },
  image: {
    class: Image,
    config:{
        uploader:{
            uploadByUrl: uploadImageByUrl ,
            uploadByFile: uploadImageByFile
        }
    }
  },
  marker: Marker,
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  inlineCode: InlineCode,
};
