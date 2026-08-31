'use client'
import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import SearchableListField from "@/components/forms/SearchableListField";
import SelectField from "@/components/forms/SelectField";
import { Button } from "@/components/ui/button";
import { signUpEmail } from "@/lib/actions/auth.actions";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form"
import { toast } from "sonner";

function SignUp() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      country: 'INDIA',
      investmentGoals: 'Growth',
      riskTolerance: 'Medium',
      preferredIndustry: 'Technology'
    },
    mode: 'onBlur'
  })
  const onSubmit = async (data: SignUpFormData) => {
    try {
      const result = await signUpEmail(data);
      if(result.success){
        router.push("/");
        toast.success("Welcome to Signalist")
      }
    } catch (e) {
      toast.error("Sign up failed",{description:e instanceof Error ? e.message : "Failed to create an account"})
    }
  }
  return (
    <>
      <h1 className="form-title">Sign up & Personalise</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name='fullName'
          label="Full Name"
          placeholder="Sagnick Dey"
          register={register}
          error={errors.fullName}
          validation={{required:'Full name is required', minLength:2}}
        />
        {/* Countries */}
        <SearchableListField
          name="country"
          label="Country"
          control={control}
          error={errors.country}
          required={true}
        />
        <InputField
          name='email'
          label="Email"
          placeholder="sample@domain.com"
          register={register}
          error={errors.email}
          validation={{required:'Email is required', pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/ , message:"Email address is required"}}
        />
        <InputField
          name='password'
          label="Password"
          placeholder="Enter a string password"
          type="password"
          register={register}
          error={errors.password}
          validation={{required:'Password is required', minLength:8}}
        />
        <SelectField
          name="investmentGoals"
          label="Investment Goals"
          placeholder="Select your investment goals"
          options={INVESTMENT_GOALS}
          control={control}
          error={errors.investmentGoals}
          required= {true}
        />
        <SelectField
          name="riskTolerance"
          label="Risk Tolerance"
          placeholder="Select your risk level"
          options={RISK_TOLERANCE_OPTIONS}
          control={control}
          error={errors.riskTolerance}
          required= {true}
        />
        <SelectField
          name="preferredIndustry"
          label="Preferred Industry"
          placeholder="Select your preferred industry"
          options={PREFERRED_INDUSTRIES}
          control={control}
          error={errors.preferredIndustry}
          required= {true}
        />
        <Button type="submit" disabled={isSubmitting} className='yellow-btn w-full mt-5'>Start your investing journey</Button>
        <FooterLink text="Already have an account?" linkText="Sign In" href="/sign-in"/>
      </form>
    </>
  )
}

export default SignUp