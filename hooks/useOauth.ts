import cookie from 'scripts/cookie'

export default () => {

  const destroyCookies = () => {
    cookie.client.destroyToken()
    cookie.client.destroyUser()
  }

  const oauth = {
    twitter: () => {
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = `${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_DOMAIN}/api/v1/auth/twitter`
      document.body.appendChild(form)
      destroyCookies()
      form.submit()
    }
  }

  return oauth
}
