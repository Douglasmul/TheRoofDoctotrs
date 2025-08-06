package com.example.roofareaestimator.util

object CalculationUtils {
    fun calculateArea(length: Double, width: Double): Double {
        return length * width
    }

    fun calculatePitchHeight(length: Double, pitch: Double): Double {
        return length * Math.tan(Math.toRadians(pitch))
    }

    fun calculateTotalRoofArea(length: Double, width: Double, pitch: Double): Double {
        val height = calculatePitchHeight(length / 2, pitch)
        val slopeLength = Math.sqrt(height * height + (width / 2) * (width / 2))
        return 2 * (length * slopeLength)
    }
}
