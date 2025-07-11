---
applyTo: '**/*.tsx, **/*.jsx'
---

# Performance Optimization

Always use the `useMemo` hook to memoize the result of a function that returns an array or object, especially when the function is computationally expensive or when the result is used in a dependency array of another hook. This helps to avoid unnecessary re-computations and ensures that the component only re-renders when the actual data changes.

Always use the `useCallback` hook to memoize functions that are passed as props to child components, especially if those functions are used in dependency arrays of other hooks. This helps to prevent unnecessary re-renders of child components.

# Code Documentation

Always comment a short description of the function or a code block in a language that is easy to understand by a regular user, that explains what the function does, especially if it is complex or not immediately clear.

# Code Standards

Never use emojis or other non-standard characters in the code, as they can cause issues with code compatibility with various tools instead prefer creating custom SVGs or using icons from `react-icons` if the code has the use of `lucide-react` replace it by using icons from `react-icons`.

Never use the names of real companies or institutions in the code, as this can lead to legal issues or confusion. Instead, use generic names or placeholders.

Never use the `any` type in TypeScript, as it defeats the purpose of type safety. Always use specific types or interfaces to ensure type safety and clarity in the code.

# Styling Guidelines

Never use default font family, import a good font from Google Fonts and apply it in the single `.tsx` file by using internal style tag. Make sure that no fallback fonts are used, as this can lead to inconsistent styling across different browsers and devices.

# UI/UX Requirements

Always try to improve the UI of the code and try to make it more user-friendly and visually appealing. This can include adding animations, improving layout, or enhancing accessibility. Make sure to consider the overall user experience and usability of the interface to make the code 10/10.

You are to focus on functionality and user experience, ensuring that the code is not only functional but also provides a smooth and intuitive experience for the user, to do that many times we need to work with fake data.

When the user explicitly asks you to make the code a "Golden Response" try to make the UI more like a Fortune 500 company's UI, focusing on a clean, professional design with a modern aesthetic. This includes using a consistent color palette, clear typography, and intuitive navigation. Consider using design systems or frameworks that are commonly used in enterprise applications to achieve this level of polish.

When the user asks you to update the UI, always ask them for their preferences or provide a few options to choose from. This ensures that the UI meets their expectations and needs.

If the user asks you to update the UI and they haven't specified a specific design or color palette, always ask them for their preferences or provide a few options to choose from. This ensures that the UI meets their expectations and needs.

If the user provides a specific design or color palette, always follow their instructions closely to ensure the UI aligns with their vision and do not use any other colors.

# Response Justification Guidelines

When the user asks you to justify the response you have to consider these Three Dimensions in Your Justification:

1. Visual Appearance (UI/UX Design Quality)
2. Code Quality (Readability, Structure, Maintainability)
3. Feature Completeness (Functionality as per the prompt)

Along with include what we did to improve the code and why it was necessary, focusing on the impact of these changes on the overall user experience and functionality of the application. Under 990 characters. And return the Justification in plain text format without any markdown or code formatting.
