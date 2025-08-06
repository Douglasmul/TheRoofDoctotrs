import com.example.roofareaestimator.util.CalculationUtils

fun main() {
    val length = 30.0
    val width = 20.0
    val pitch = 35.0

    val area = CalculationUtils.calculateTotalRoofArea(length, width, pitch)
    println("Estimated roof area: $area square feet")

