
import { Hono } from 'hono';
// import { config } from 'dotenv';
// config()
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

import { sign,verify } from 'hono/jwt';

import {signinInput,signupInput} from '@juniad/medium-common';

export let userRouter=new Hono<{
	Bindings:{
		DATABASE_URL:string,
		JWT_SECRET:string
	} 
}>() 

userRouter.post('/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	try {

		let {success}=signupInput.safeParse(body)

		if(!success){
			return c.json({
			msg:"Inputs not correct"
		})
	}
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password
			}
		});
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	} catch(e) {

		console.error('error',e)
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
})


userRouter.post('/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();

	let {success}=signinInput.safeParse(body)

		if(!success){
			return c.json({
			msg:"Inputs not correct"
		})
	}
	const user = await prisma.user.findUnique({
		where: {
			email: body.email,
			password:body.password
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ error: "user not found" });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
})