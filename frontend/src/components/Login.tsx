import {useNavigate, Link} from 'react-router-dom'

import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
} from '@/components/ui/card'
import {Credential, credentialSchema} from '@shared/schemas'
import useGUser from '@/controllers/useGUser'
import DataForm from './DataForm'

export const Login = () => {
  const navigate = useNavigate()
  const {login} = useGUser()

  const onLogin = async (data: Credential) => {
    await login(data)
    void navigate('/')
  }

  const form = {
    data: {
      username: {
        init: '',
        name: 'Username',
      },
      password: {
        init: '',
        name: 'Password',
        type: 'password',
      },
    },
    schema: credentialSchema.shape.credential,
    submit: {
      name: 'Login',
      handler: onLogin,
    },
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full sm:w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataForm {...form} />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link to="/signup" className="text-sm text-blue-600 hover:underline">
            Don't have an account? Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
