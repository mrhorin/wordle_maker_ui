import { toast, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useTheme from 'hooks/useTheme'

export default () => {
  const { getTheme } = useTheme()

  function theme(): 'light' | 'dark' | 'colored'{
    if (getTheme() == "dark") return "dark"
    if (getTheme() == "light") return "light"
    return "dark"
  }

  function alertSuccess(msg: string): void{
    toast.success(msg, {
      position: "top-center",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: theme(),
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
      theme: theme(),
      transition: Bounce,
    })
  }

  return { alertSuccess, alertError }
}
