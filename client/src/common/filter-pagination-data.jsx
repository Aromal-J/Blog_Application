import axios from "axios";

export const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send ={},
}) => {
  let obj;

  
  if (state !== null && !create_new_arr) {
    console.log('inside if');
    
    obj = { ...state, results: [...state.results, ...data], page };
    
  } else {
    console.log('inside else');
    
    try {
      let {
        data: { totalDocs },
      } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + countRoute,
        data_to_send
      );

      console.log('inside else 2');
      
      obj= {results: data, page:1, totalDocs}
    } catch (err) {
      console.log(err);
    }
  }

  return obj
};
