# image-editor-electron
An electron implementation of Gaussian blur optimization display application

### 高斯模糊

高斯模糊实现的模糊效果非常平滑，对于每一个像素，它会取它本身及其周围一定范围内的像素，去计算模糊后的效果，每个像素在计算过程中所占的权重并不相同，距离其本身越近，权重越高 。权重的计算公式如下：


当我们的矩阵有n个值时，对于较大的半径, 比如 r = 10, 一共需要做 n * 400 次运算, 而对于一个矩阵上的这么多次运算，计算量太大.

### 方框模糊

对于 **方框模糊**. 它是函数 f 和权重 w 的卷积, 但权重是恒定的，并且位于正方形（方框）内。方框模糊的优良特性是，方框模糊的多个过程（卷积）近似于高斯模糊的过程，并且由于半径的权重都相等而不需要计算耗时的权重。

这里需要将高斯模糊中的$r$标准差转换成方框模糊的 br

虽然所用时间比高斯模糊短，但其效果不是很平滑。而[这篇论文](https://www.peterkovesi.com/papers/FastGaussianSmoothing.pdf)提出了提升模糊效果的方案。

根据论文中所述，可以通过多次的方框模糊实现高斯模糊

效果和高斯模糊基本一致,在时间复杂度与高斯模糊相同的情况下，得到的半径更小，因此计算的速度要比高斯模糊更快。

### 水平和垂直模糊

在水平方向和垂直方向上分别使用模糊滤波计算,

两个函数在一条直线上循环，计算出了一维模糊。而此时总模糊对应的是：这两种模糊合并后是方框模糊，时间复杂度得到了优化.

### 快速模糊

一维模糊的计算速度可以更快。当计算水平模糊时。我们计算b_h[i,j], b_h[i,j+1], b_h[i,j+2], ...，而邻近的值为b_h[i,j] 和 b_h[i,j+1]，两者几乎相同，唯一的区别在于最左边的一个值和最右边的一个值。所以b_h[i,j+1] = b_h[i,j] + f[i,j+r+1] - f[i,j-r].

在快速模糊中，我们将通过创建**累加器**来计算一维模糊。首先，我们将最左边的单元格的值放入其中。然后，我们将计算下一个值，只需取得上一个值来进行计算。这种一维模糊具有 O(n)(独立于 r)的时间复杂度。先执行两次之后得到方块模糊，然后再执行3次得到高斯模糊。因此该快速高斯模糊的复杂度是6 * O(n).

### 总结

高斯模糊本身的计算量很大，计算时间长，而通过方框模糊和水平垂直方向上的多种优化，可以在不降低模糊的质量的同时大幅减少计算的时间复杂度。
