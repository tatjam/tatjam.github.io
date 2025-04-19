Understanding undersampling - 1
2025-04-15
Using the Fourier transform and interactive graphics to intuitively understand undersampling transmitters

It's possible to generate nearly arbitrarily high frequency signals using a relatively slow transmitter by exploiting undersampling. In this post I will try to give an intuitive explanation of the mechanism, and try to find the optimum sample frequency to emit a given signal.

---


	

I found this [fascinating video](https://www.youtube.com/watch?v=eIdHBDSQHyw), which showcases the emission of LORA signals using nothing more than a GPIO on a microcontroller. Of course, the microcontroller cannot directly synthesize the radio frequency signal (at around 900MHz), so instead high harmonics of the GPIO square wave output are used. The mechanism to actually synthesize the signal is remarkable: sample the signal you want to emit at your desired GPIO frequency, and use that sampled data to drive your pin.

As a prerequisite for this article, you will need to know to have some familiarity with the Fourier transform and convolutions.

# Sampling our signal

We will consider a really simple signal \\( g(t) = \cos (2 π f_0 t) = \frac{1}{2} e^{2 π f_0 t i} + \frac{1}{2} e^{-2 π f_0 t i} \\), which is the signal we want to emit from our device. An ideal sampling device would capture infinitely thin slices of the signal. Such slices have a vanishingly small quantity of energy, so the sampler needs greater and greater gain as we thin the slice. The mathematical symbol to represent such behavior is the Dirac delta \\(δ\\), which allows us to write the sampled signal as:

$$
    g_s(t) = g(t) \sum_{n=-∞}^{∞} δ(t - n T)
$$

Where \\( T \\) is the time between each sample being taken. 

If we take the Fourier transform [^1] of \\( g(t) \\) we find its spectrum \\( G(ω) \\), which also uses the Dirac delta:

[^1]: I'm using the unitary Fourier transform, which leads to neater expressions.

$$
    G(f) = \frac{1}{2} δ(f -  f_0) + \frac{1}{2} δ(f + f_0)
$$

## The spectrum of the sampled signal

To compute the spectrum of the sampled signal, we can apply the convolution theorem. It states that the Fourier transform of the product of two functions is the convolution of their respective Fourier transforms (the converse is also true). We can obtain the Fourier transform of the "sampling function" (Dirac comb) and find it to be:

$$
    \frac{1}{T} \sum_{n=-∞}^{∞} δ\left(f - \frac{n}{T}\right)
$$

Now, we need to convolve the previous expression with \\(G(ω)\\). The convolution of a Dirac delta with another obeys the following law: 

$$
    δ(t - a) ⊛ δ(t - b) = δ(t - (a + b)) 
$$

Thus we may write the spectrum of the sampled signal by applying the previous "law" linearly:

$$
    G_s(f) = \sum_{n=-∞}^{∞} δ\left(f - \left(\frac{n}{T} ± f_0\right) \right) 
$$

The following graph allows you to play around with the values and get a feel for the results.

<p id="freq_elem">
    Consider \( f_0 \) = <input data-var="f0" class="DraggableNumber">Hz</input> 
    and \( \frac{1}{T} = f_s \) = <input data-var="fs" class="DraggableNumber">Hz</input>. We obtain the spectrum:
</p>


<div class="canvas-container" style="height: 10em">
<canvas id="graph0"></canvas>
</div>


Sure enough, our original frequency is one of the components of the sampled signal. Note that if you reduce the signal frequency to within the Nyquist zone (grey area), the signal is perfectly reproduced within that area, without any spurious signal appearing.

# The zero-order hold

Our ideal sampling process can be easily achieved within a computer by sampling a mathematical representation of a signal. But, outputting such a signal from a microcontroller would prove impossible, as it would require generating infinitely fast pulses. A more realistic approximation is to state that we may generate a square-wave. For simplicity, we will assume that its edges are instantaneous. Mathematically, this is referred to as a zero-order hold:

We can represent such a device as a convolution in the time domain between our sampled signal and the "boxcar" function:

Applying the convolution theorem, we can obtain the spectrum of the resulting signal as the product of the spectrum of the original samples, and of the spectrum of the "boxcar" function. So, lets write down its spectrum:

$$

$$

Due to the denominator, the bigger \\( ω_0 \\) is, the more attenuation we have. Furthermore, if \\( ω_0 \\) is badly placed it may be completely attenuated. 

# Optimum sampling frequency

We will consider the problem of finding the optimum sampling frequency to best represent \\( g(t) \\) with our sample-zero-order-hold system, given a lower limit on \\( T \\). This limit is usually imposed by the clock of the microcontroller's GPIO (General Purpose Input Output). By "best represent", we mean:

- Generating an output signal that contains as much power as possible in its spectrum at frequency \\( ω_0 \\)
- Having the least possible cluttering signals around \\( ω_0 \\) so we can use a wide band-pass filter to isolate our desired signal

Of course, if our \\( T \\) is small enough that it satisfies the Nyquist criterion, we can just output the signal "as-is", and apply a low-pass filter to eliminate higher order harmonics. We are instead interested in the case where \\( T \\) is relatively big.

# Further non-idealities

During the whole text, we have considered that we can output any power level, but in reality we will be limited to outputting either zero power or maximum power. In the next post I will try to derive the effect of such a "distortion" on our signal. Indeed, this quantization will imply the appearance of a lot of distortion in the output signal, but our fundamental frequency will remain. Finally, I will present a real-life experiment where we put to test all of these mathematics in a device, and try to emit some meaningful radio waves.



<script type="text/javascript">

    function setUpTangle () {

        var freq_elem = document.getElementById("freq_elem");
        var canvas = document.getElementById("graph0");
        const ctx = canvas.getContext("2d");

        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        var tangle = new Tangle(freq_elem, {
            initialize: function () {
                this.f0 = 150.0
                this.fs = 50.0
            },
            update: function () {
                const zeroff = 0.8;
                const linesize = 50.0;
                const marksize = 50.0;

                ctx.strokeStyle = "#000000";
                ctx.fillStyle = "#000000";
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Axes
                ctx.beginPath();
                ctx.moveTo(0, canvas.height * zeroff);
                ctx.lineTo(canvas.width, canvas.height * zeroff);
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.stroke();

                // Hz / pixel
                const scale = 0.5;
                const step = 50.0;
                const substep = 10.0
                const span = Math.ceil(canvas.width / 2 * scale / step) * step;


                ctx.fillStyle = "#00000033"
                nyq0 = -this.fs / scale * 0.5 + canvas.width * 0.5;
                nyq = this.fs / scale;
                ctx.beginPath();
                ctx.rect(nyq0, 0, nyq, canvas.height);
                ctx.fill();
                
                ctx.fillStyle = "#000000";

                ctx.beginPath();
                ctx.strokeStyle = "#666666";
                ctx.font = "10px sans"

                for(var f = -span; f < span; f += step) 
                {
                    x = f / scale + canvas.width * 0.5;
                    ctx.moveTo(x, canvas.height * zeroff - 5.0);
                    ctx.lineTo(x, canvas.height * zeroff + 5.0);
                    ctx.fillText(f, x, canvas.height * zeroff + 14.0);
                }
                
                for(var f = -span; f < span; f += substep) 
                {
                    x = f / scale + canvas.width * 0.5;
                    ctx.moveTo(x, canvas.height * zeroff - 3.0);
                    ctx.lineTo(x, canvas.height * zeroff + 3.0);
                }

                ctx.stroke();

                ctx.strokeStyle = "#6666ff";
                ctx.beginPath();
                const maxn = 50;
                console.log(typeof this.fs)
                console.log(this.f0)
                for(var n = -maxn; n < maxn; n++) 
                {
                    var f1 = n * this.fs + this.f0;
                    var f2 = n * this.fs - this.f0;
                    var x1 = f1 / scale + canvas.width * 0.5;
                    var x2 = f2 / scale + canvas.width * 0.5;
                    ctx.moveTo(x1, canvas.height * zeroff);
                    ctx.lineTo(x1, canvas.height * zeroff - linesize);
                    ctx.moveTo(x2, canvas.height * zeroff);
                    ctx.lineTo(x2, canvas.height * zeroff - linesize);
                }
                
                ctx.stroke();
                
                ctx.strokeStyle = "#ff6666";
                ctx.fillStyle = "#ff6666";

                ctx.beginPath();
                var x0 = this.f0 / scale + canvas.width * 0.5;
                var x0p = -this.f0 / scale + canvas.width * 0.5;
                ctx.moveTo(x0, canvas.height * zeroff - linesize);
                ctx.lineTo(x0, canvas.height * zeroff - linesize - marksize);
                ctx.moveTo(x0p, canvas.height * zeroff - linesize);
                ctx.lineTo(x0p, canvas.height * zeroff - linesize - marksize);
                ctx.stroke();

                ctx.fillText(this.f0, x0, canvas.height * zeroff - linesize - marksize);
                ctx.fillText(-this.f0, x0p, canvas.height * zeroff - linesize - marksize);


            }
        });
    }

    window.onload = setUpTangle

</script>

