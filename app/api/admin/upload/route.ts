import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          error: 'Cloudinary is not configured',
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: 'Please select an image',
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Only JPG, PNG and WebP images are allowed',
        },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'Image must be 5MB or smaller',
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const stream =
        cloudinary.uploader.upload_stream(
          {
            folder: 'tasty-bite/menu',
            resource_type: 'image',

            // Keep complete artwork.
            // Never crop left/right or top/bottom.
            transformation: [
              {
                width: 1200,
                height: 750,
                crop: 'limit',
                quality: 'auto',
                fetch_format: 'auto',
              },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(
                new Error(
                  'Cloudinary did not return an upload result'
                )
              );
              return;
            }

            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );

      stream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(
      'Image upload failed:',
      error
    );

    return NextResponse.json(
      {
        error: 'Unable to upload image',
      },
      { status: 500 }
    );
  }
}