<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShhPhotoResource;
use App\Models\Shh;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShhPhotoController extends Controller
{
    public function show(Request $request, Shh $shh): JsonResponse
    {
        if (! $shh->has_photo) {
            return response()->json([
                'error' => [
                    'code' => 'no_photo',
                    'message' => 'Ce shh ne contient pas de photo.',
                    'status' => 404,
                ],
            ], 404);
        }

        $photo = $shh->photo;

        if (! $photo) {
            return response()->json([
                'error' => [
                    'code' => 'photo_not_ready',
                    'message' => 'La photo est en cours de traitement.',
                    'status' => 404,
                ],
            ], 404);
        }

        return response()->json([
            'data' => new ShhPhotoResource($photo),
        ]);
    }
}
