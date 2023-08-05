import { object, string, number } from 'yup';

const userValidationSchema = object({
    name: string().required(),
    age: number().positive().integer(),
    email: string().required().email(),
    password: string().min(8).required(),
    website: string().url().nullable(),
    gender: string(),
    location: string()
})

export default userValidationSchema