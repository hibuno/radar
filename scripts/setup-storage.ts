#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function setupStorage() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing required environment variables:");
    console.error("   NEXT_PUBLIC_SUPABASE_URL:", !!SUPABASE_URL);
    console.error("   SUPABASE_SERVICE_ROLE_KEY:", !!SUPABASE_SERVICE_ROLE_KEY);
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log("🔍 Checking if images bucket exists...");

    // List all buckets
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Error listing buckets:", listError);
      return;
    }

    const imagesBucket = buckets?.find((bucket) => bucket.id === "images");

    if (imagesBucket) {
      console.log("✅ Images bucket already exists");
    } else {
      console.log("📦 Creating images bucket...");

      const { data, error } = await supabase.storage.createBucket("images", {
        public: true,
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif",
        ],
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        console.error("❌ Error creating bucket:", error);
        return;
      }

      console.log("✅ Images bucket created successfully");
    }

    // Test upload
    console.log("🧪 Testing upload...");
    const testBuffer = Buffer.from("test image data");
    const testFileName = `test-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(testFileName, testBuffer, {
        contentType: "image/png",
      });

    if (uploadError) {
      console.error("❌ Test upload failed:", uploadError);
      return;
    }

    console.log("✅ Test upload successful");

    // Clean up test file
    await supabase.storage.from("images").remove([testFileName]);
    console.log("🧹 Test file cleaned up");

    console.log("🎉 Storage setup completed successfully!");
  } catch (error) {
    console.error("💥 Setup failed:", error);
  }
}

setupStorage();
