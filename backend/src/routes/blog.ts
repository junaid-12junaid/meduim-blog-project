
import { Hono } from 'hono';
// import { config } from 'dotenv';
// config()
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

import { sign,verify } from 'hono/jwt';
import {createBlogInput,updateBlogInput} from '@juniad/medium-common';


export let blogRouter=new Hono<{
	Bindings:{
		DATABASE_URL:string,
		JWT_SECRET:string
	},
	Variables:{
		userId:string
	} 
}>() 

blogRouter.use('/*', async (c, next) => {
	
	let header=c.req.header('authorization')||""

	if(header=="") return c.json({
		error:"Provide the authorization headers"
	})

	let res=await verify(header,c.env.JWT_SECRET)
	if(res.id){
        // c.req.json().id=res.id
		c.set("userId",`${res.id}`)
		await next()
	}else{
		c.status(403)

		return c.json({error:"unauthorized"
		})
	}
  })


  blogRouter.post('/', async(c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	let userId=c.get("userId")
	const body = await c.req.json();
	let {success}=createBlogInput.safeParse(body)

		if(!success){
			return c.json({
			msg:"Inputs not correct"
		})
	}
	try {
		const blog = await prisma.post.create({
			data: {
				title: body.title,
				content:body.content,
                authorId:userId
			}
		});
		
		return c.json({ id:blog.id });
	} catch(e) {

		console.error('error',e)
		c.status(403);
		return c.json({ error: "error creating a blog" });
	}

	
})


blogRouter.get('/bulk', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	try {
		const blog = await prisma.post.findMany();
		
		return c.json({blog});
	} catch(e) {

		console.error('error',e)
		c.status(403);
		return c.json({ error: "error while fetching all blog" });
	}
})

blogRouter.get('/:id', async (c) => {
	const id = c.req.param('id')

	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	try {
		const blog = await prisma.post.findFirst({
			where:{
				id:id
			}
		});
		
		return c.json({blog});
	} catch(e) {

		console.error('error',e)
		c.status(403);
		return c.json({ error: "error while fetching a blog" });
	}
})




blogRouter.put('/', async(c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	let {success}=updateBlogInput.safeParse(body)

	if(!success){
		return c.json({
		msg:"Inputs not correct"
	})
}
	try {
		const blog = await prisma.post.update({
            where:{
                id:body.id
            },
			data: {
				title: body.title,
				content:body.content
			}
		});
		
		return c.json({ id:blog.id });
	} catch(e) {

		console.error('error',e)
		c.status(403);
		return c.json({ error: "error updating a blog" });
	}
})
