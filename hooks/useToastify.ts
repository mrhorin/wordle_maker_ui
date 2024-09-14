import { toast, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default () => {

  function alertSuccess(msg: string): void{
    toast.success(msg, {
      position: "top-center",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    })
  }

  function alertError(msg: string): void{
    toast.error(msg, {
      position: "top-center",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    })
  }

  return { alertSuccess, alertError }
}
