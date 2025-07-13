import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(
	({ className, type, secured = false, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);

		const togglePasswordVisibility = () => {
			setShowPassword(!showPassword);
		};

		return (
			<div className="relative">
				<input
					type={secured ? (showPassword ? "text" : "password") : type}
					className={cn(
						"flex h-9 w-full rounded-md border border-input dark:border-gray-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-tomorrow",
						secured && "pr-10",
						className
					)}
					ref={ref}
					{...props}
				/>
				{secured && (
					<button
						type="button"
						onClick={togglePasswordVisibility}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</button>
				)}
			</div>
		);
	}
);
Input.displayName = "Input";

export { Input };
