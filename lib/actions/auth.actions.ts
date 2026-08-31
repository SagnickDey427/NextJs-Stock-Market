"use server";

import { headers } from "next/headers";
import { auth } from "../better-auth/auth";
import { inngest } from "../inngest/client";

export const signUpEmail = async ({
  email,
  password,
  fullName,
  investmentGoals,
  country,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData) => {
  try {
    //Better auth signing up the user ( adding records in db, hashing , sessions , auto-signin)
    const response = await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });
    if (response) {
      //If signing in was successful , then we send welcome email using inngest, via the event "app/user.created"
      await inngest.send({
        name: "app/user.created",
        data: {
          email,
          name: fullName,
          country,
          investmentGoals,
          riskTolerance,
          preferredIndustry,
        },
      });
    }
    return { success: true, data: response };
  } catch (e) {
    console.log(`Error in signing up user : ${e}`);
    return { success: false, message: "Sign up failed!" };
  }
};

export const signInEmail = async ({ email, password }: SignInFormData) => {
  try {
    const response = await auth.api.signInEmail({
      body: { email, password },
    });
    
    return { success: true, data: response };
  } catch (e) {
    console.log(`Error in signing in user : ${e}`);
    return { success: false, message: "Sign in failed!" };
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { success: true, message: "sign out successfully" };
  } catch (error) {
    console.log(`Sign out failure`);
    console.log(error);
    return { success: false, message: `Sign out failed` };
  }
};
