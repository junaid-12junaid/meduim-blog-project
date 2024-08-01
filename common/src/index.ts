import z from "zod"

export let signupInput=z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name:z.string().optional()
})

export type SignupInput=z.infer<typeof signupInput>

export let signinInput=z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export type SigninInput=z.infer<typeof signinInput>

export let createBlogInput=z.object({
    title:z.string(),
				content:z.string()
})

export type CreateBlogInput=z.infer<typeof createBlogInput>

export let updateBlogInput=z.object({
    title:z.string(),
				content:z.string(),
                id:z.string()
})

export type UpdateBlogInput=z.infer<typeof updateBlogInput>
