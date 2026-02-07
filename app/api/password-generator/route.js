import { NextResponse } from "next/server";
import { generateKey } from "@/utils/kdsm";
import { getWordsByLength } from "@/utils/constants";

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// GET endpoint for simple integration via query params
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lengthParam = parseInt(searchParams.get("length") || "0", 10);
  
  // Get additional options
  const useCustomWord = searchParams.get("useCustomWord") === "true";
  const useReadablePassword = searchParams.get("useReadablePassword") === "true";
  const customWord = searchParams.get("customWord") || "";
  
  // Validate length bounds to prevent abuse
  if (isNaN(lengthParam) || lengthParam <= 0 || lengthParam > 128) {
    return NextResponse.json(
      { error: "Length must be between 1 and 128" },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
  
  // Validate custom word if provided
  if (useCustomWord && (!customWord || customWord.length < 3 || customWord.length > 14)) {
    return NextResponse.json(
      { error: "Custom word must be between 3 and 14 characters" },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
  
  const options = {
    includeNumbers: searchParams.get("includeNumbers") === "true",
    includeSpecialChars: searchParams.get("includeSpecialChars") === "true",
    includeUppercase: searchParams.get("includeUppercase") === "true",
    includeLowercase: searchParams.get("includeLowercase") === "true",
    excludeSimilar: searchParams.get("excludeSimilar") === "true",
    customWorded: useCustomWord && customWord ? customWord : undefined,
    useReadablePassword,
    getWordsByLength: useReadablePassword ? getWordsByLength : undefined,
  };
  
  const password = await generateKey(lengthParam, options);
  return NextResponse.json(
    { password },
    { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
  );
}

// POST endpoint for sending JSON body with options
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      length,
      includeNumbers,
      includeSpecialChars,
      includeUppercase,
      includeLowercase,
      excludeSimilar,
      useCustomWord,
      useReadablePassword,
      customWord,
    } = body;
    
    const lengthNum = typeof length === "number" ? length : parseInt(length, 10);
    // Validate length bounds to prevent abuse
    if (isNaN(lengthNum) || lengthNum <= 0 || lengthNum > 128) {
      return NextResponse.json(
        { error: "Length must be between 1 and 128" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }
    
    // Validate custom word if provided
    if (useCustomWord && (!customWord || customWord.length < 3 || customWord.length > 14)) {
      return NextResponse.json(
        { error: "Custom word must be between 3 and 14 characters" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }
    
    const options = {
      includeNumbers,
      includeSpecialChars,
      includeUppercase,
      includeLowercase,
      excludeSimilar,
      customWorded: useCustomWord && customWord ? customWord : undefined,
      useReadablePassword,
      getWordsByLength: useReadablePassword ? getWordsByLength : undefined,
    };
    
    const password = await generateKey(lengthNum, options);
    return NextResponse.json(
      { password },
      { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error).message || "Internal error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
