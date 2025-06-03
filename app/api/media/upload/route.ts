import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/middleware/auth"
import { DatabaseService } from "@/lib/config/database"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const filename = `${timestamp}_${randomString}${extension}`
    const filePath = path.join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save to database
    const result = DatabaseService.createMediaFile({
      user_id: user.id,
      filename,
      original_name: file.name,
      file_path: `/uploads/${filename}`,
      file_size: file.size,
      mime_type: file.type,
      width: null, // Would be extracted for images
      height: null,
      alt_text: "",
      tags: [],
    })

    const mediaFile = {
      id: result.lastInsertRowid,
      filename,
      original_name: file.name,
      file_path: `/uploads/${filename}`,
      file_size: file.size,
      mime_type: file.type,
      url: `/uploads/${filename}`,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      file: mediaFile,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
})
