window.onload = main;

function main()
{
    const canvas      = document.querySelector("#LyapunovCanvas");
    const seqTextArea = document.querySelector("#LyapunovSequence");
    
    const radioButtonFire    = document.querySelector("#RadioThemeFire");
    const radioButtonElectro = document.querySelector("#RadioThemeElectro");
    const radioButtonClassic = document.querySelector("#RadioThemeClassic");

    const gl             = canvas.getContext("webgl2");
    const extFloatTex    = gl.getExtension("EXT_color_buffer_float");
    const extLinFloatTex = gl.getExtension("OES_texture_float_linear");
    if (!gl || !extFloatTex || !extLinFloatTex)
    {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    seqTextArea.addEventListener("input", function()
    {
        window.cancelAnimationFrame(currAnimationFrame);

        seqTextArea.value = seqTextArea.value.replace(/[^AaBb]/g, "");
        seqTextArea.value = seqTextArea.value.toUpperCase();

        if(seqTextArea.value !== "" && seqTextArea.value !== seqStr)
        {
            seqStr = seqTextArea.value;

            resetValues();
            currAnimationFrame = window.requestAnimationFrame(mainDraw);
        }
        else
        {
            currAnimationFrame = window.requestAnimationFrame(mainDraw);
        }
    });

    canvas.onwheel = function(event)
    {
        event.preventDefault();

        window.cancelAnimationFrame(currAnimationFrame);

        console.log(event.deltaY);

        var prevSpaceScaleX = spaceScale[0];
        var prevSpaceScaleY = spaceScale[1];

        var currSpaceScaleX = prevSpaceScaleX * Math.pow(1.05, event.deltaY * 0.2);
        var currSpaceScaleY = prevSpaceScaleY * Math.pow(1.05, event.deltaY * 0.2);

        //Jumping over [2, 2] case
        if((prevSpaceScaleX > 2.0 && currSpaceScaleX < 2.0 && prevSpaceScaleY > 2.0 && currSpaceScaleY < 2.0)
        || (prevSpaceScaleX < 2.0 && currSpaceScaleX > 2.0 && prevSpaceScaleY < 2.0 && currSpaceScaleY > 2.0))
        {
            spaceScale[0] = 2.0;
            spaceScale[1] = 2.0;
        }
        else if((prevSpaceScaleX > 1.0 && currSpaceScaleX < 1.0 && prevSpaceScaleY > 1.0 && currSpaceScaleY < 1.0)
             || (prevSpaceScaleX < 1.0 && currSpaceScaleX > 1.0 && prevSpaceScaleY < 1.0 && currSpaceScaleY > 1.0))
        {
            spaceScale[0] = 1.0;
            spaceScale[1] = 1.0;
        }
        else
        {
            spaceScale[0] = currSpaceScaleX;
            spaceScale[1] = currSpaceScaleY;
        }

        resetValues();
        currAnimationFrame = window.requestAnimationFrame(mainDraw);
    }

    canvas.onmousedown = function(event)
    {
        cancelAnimationFrame(currAnimationFrame);
    }

    canvas.onmousemove = function(event)
    {
        if(event.buttons & 1 != 0)
        {
            var rangeX = spaceScale[0] * (4.0 - 0.0);
            var rangeY = spaceScale[1] * (4.0 - 0.0);

            spaceTranslate[0] -= 0.2 * rangeX * event.movementX / standardWidth;
            spaceTranslate[1] += 0.2 * rangeY * event.movementY / standardHeight;
        }
    }

    canvas.onmouseup = function(event)
    {
        resetValues();
        currAnimationFrame = window.requestAnimationFrame(mainDraw);
    }

    radioButtonFire.onclick = function()
    {
        colorMultiply = [1.0,  1.0,  1.0,  1.0];
        colorAdd      = [0.0, -1.0, -2.0,  0.0];
        colorAbsMix   = [1.0,  1.0,  1.0,  1.0];
    }

    radioButtonElectro.onclick = function()
    {
        colorMultiply = [0.5,  0.1,  1.0,  1.0];
        colorAdd      = [0.0,  0.0,  0.0,  0.0];
        colorAbsMix   = [1.0,  1.0,  1.0,  1.0];
    }

    radioButtonClassic.onclick = function()
    {
        colorMultiply = [ 0.22,  0.18,  0.70,  1.0];
        colorAdd      = [ 0.74,  0.58,  0.41,  0.0];
        colorAbsMix   = [ 0.14,  0.14,  0.10,  0.0];
    }
    
    var seqStr   = seqTextArea.value;
    var seqIndex = 0;

    var currAnimationFrame = 0;

    var spaceScale     = [2.0,  2.0]; //[-1, 1] -> [-2, 2]
    var spaceTranslate = [2.0,  2.0]; //[-2, 2] -> [ 0, 4]; 

    var colorMultiply = [1.0,  1.0,  1.0,  1.0];
    var colorAdd      = [0.0, -1.0, -2.0,  0.0];
    var colorAbsMix   = [1.0,  1.0,  1.0,  1.0];

    const standardWidth  = canvas.clientWidth;
    const standardHeight = canvas.clientHeight;
    const textureWidth   = standardWidth  * 2;
    const textureHeight  = standardHeight * 2;

    var resetShaderProgram    = null;
    var lyapunovShaderProgram = null;
    var finalShaderProgram    = null;
    var staticShaderProgram   = null;

    var lyapunovPrevXTextureLocation      = null;
    var lyapunovPrevLambdaTextureLocation = null;
    var finalLambdaTextureLocation        = null;

    var lyapunovIndexUniformLocation = null;
    var lyapunovSnUniformLocation    = null;
    var resetSnUniformLocation       = null;

    var resetScaleSpaceUniformLocation     = null;
    var resetTranslateSpaceUniformLocation = null;

    var lyapunovScaleSpaceUniformLocation     = null;
    var lyapunovTranslateSpaceUniformLocation = null;

    var colorMultiplyUniformLocation = null;
    var colorAddUniformLocation      = null;
    var colorAbsMixUniformLocation   = null;

    var relativeTranslateUniformLocation = null;

    var xLambdaFrameBuffer = null;

    var xTex1      = null;
    var xTex2      = null;
    var lambdaTex1 = null;
    var lambdaTex2 = null;

    var resetVertexBuffer    = null;
    var lyapunovVertexBuffer = null;
    var finalVertexBuffer    = null;

    createShaders();
    createTextures();
    createBuffers();

    resetValues();
    mainDraw();

    function createTextures()
    {
        xTex1 = gl.createTexture();
        xTex2 = gl.createTexture();
        lambdaTex1 = gl.createTexture();
        lambdaTex2 = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, xTex1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, textureWidth, textureHeight, 0, gl.RED, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindTexture(gl.TEXTURE_2D, xTex2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, textureWidth, textureHeight, 0, gl.RED, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindTexture(gl.TEXTURE_2D, lambdaTex1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, textureWidth, textureHeight, 0, gl.RED, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindTexture(gl.TEXTURE_2D, lambdaTex2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, textureWidth, textureHeight, 0, gl.RED, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);

        xLambdaFrameBuffer = gl.createFramebuffer();
    }

    function createShaders()
    {
        const vsLyapunovSource = 
        `#version 300 es

        layout(location=0) in mediump vec4 vScreenPos;
        layout(location=1) in mediump vec2 vScreenAB;
        layout(location=2) in mediump vec2 vScreenTex;

        out highp vec2 vSpacePosition;
        out highp vec2 vTexCoord;

        uniform highp vec2 gScale;
        uniform highp vec2 gTranslate;

        void main(void) 
        {
            gl_Position    = vScreenPos;
            vSpacePosition = vScreenAB * gScale + gTranslate;
            vTexCoord      = vScreenTex;
        }`;

        const fsLyapunovSource = 
        `#version 300 es 

        uniform uint gSn;
        uniform uint gIndex;
        
        uniform highp sampler2D gPrevX;
        uniform highp sampler2D gPrevLambda;
        
        in highp vec2 vSpacePosition;
        in highp vec2 vTexCoord; 
        
        layout(location=0) out highp float oNextX;
        layout(location=1) out highp float oNextLambda;
        
        void main(void)
        {
            highp float rn;
            if(gSn == 0u)
            {
                rn = vSpacePosition.x;
            }
            else
            {
                rn = vSpacePosition.y;
            }
        
            highp float xn      = texture(gPrevX,      vTexCoord).r;
            highp float lambdan = texture(gPrevLambda, vTexCoord).r;
        
            highp float prevCoeff = float(gIndex - 1u) / float(gIndex);
            highp float thisCoeff = 1.0f               / float(gIndex);
        
            oNextX      = rn * xn * (1.0f - xn);
            oNextLambda = prevCoeff * lambdan + thisCoeff * log(abs(rn * (1.0f - 2.0f * xn)));
        }`;

        const vsFinalSource = 
        `#version 300 es

        layout(location=0) in mediump vec4 vScreenPos;
        layout(location=1) in mediump vec2 vScreenTex;
            
        out mediump vec2 vTexCoord;
        
        void main(void)
        {
            gl_Position = vScreenPos;	
            vTexCoord   = vScreenTex;
        }`;     
        
        const fsFinalSource = 
        `#version 300 es
	
        uniform highp sampler2D gLambdaTex;
        
        uniform lowp vec4 gColorMultiply;
        uniform lowp vec4 gColorAdd;
        uniform lowp vec4 gColorAbsMix;
        
        in mediump vec2 vTexCoord;
        
        layout(location = 0) out lowp vec4 colorMain;
        
        void main(void)
        {
            highp float lambda = texture(gLambdaTex, vTexCoord).x;
        
            //To choose between abs(lambda) and lambda as color source
            highp vec4 baseColor = vec4(lambda, lambda, lambda, 1.0f);
            highp vec4 absColor  = abs(baseColor);
            
            lowp vec4 mixColor = mix(baseColor, absColor, gColorAbsMix);
            
            colorMain = mixColor * gColorMultiply + gColorAdd;
        }`;

        const vsResetSource = 
        `#version 300 es

        layout(location=0) in mediump vec4 vScreenPos;
        layout(location=1) in mediump vec2 vScreenAB;
        layout(location=2) in mediump vec2 vScreenTex;
        
        out mediump vec2 vSpacePosition;
        out mediump vec2 vTexCoord;
        
        uniform highp vec2 gScale;
        uniform highp vec2 gTranslate;

        void main(void) 
        {
            gl_Position    = vScreenPos;
            vSpacePosition = vScreenAB * gScale + gTranslate;
            vTexCoord      = vScreenTex;
        }`;
        
        const fsResetSource =
        `#version 300 es 

        uniform uint gSn;
        
        in mediump vec2 vSpacePosition;
        in mediump vec2 vTexCoord; 
        
        layout(location=0) out highp float oNextX;
        layout(location=1) out highp float oLambda;
        
        void main(void)
        {
            //Previuos x is 0.5, previous lambda is 0
        
            highp float rn;
            if(gSn == 0u)
            {
                rn = vSpacePosition.x;
            }
            else
            {
                rn = vSpacePosition.y;
            }
        
            oNextX  = rn * 0.5f * 0.5f;
            oLambda = 0.5f;
        }`;

        const vsStaticSource = 
        `#version 300 es

        layout(location=0) in mediump vec4 vScreenPos;
        layout(location=2) in mediump vec2 vScreenTex;

        out highp vec2 vSpacePosition;
        out highp vec2 vTexCoord;

        uniform highp vec2 gRelativeTranslate;

        void main(void) 
        {
            gl_Position = vScreenPos;
            vTexCoord   = vScreenTex + gRelativeTranslate;
        }`;

        const fsStaticSource = 
        `#version 300 es
	
        uniform highp sampler2D gLambdaTex;
        
        uniform lowp vec4 gColorMultiply;
        uniform lowp vec4 gColorAdd;
        uniform lowp vec4 gColorAbsMix;
        
        in mediump vec2 vTexCoord;
        
        layout(location = 0) out lowp vec4 colorMain;
        
        void main(void)
        {
            highp float lambda = texture(gLambdaTex, vTexCoord).x;
        
            //To choose between abs(lambda) and lambda as color source
            highp vec4 baseColor = vec4(lambda, lambda, lambda, 1.0f);
            highp vec4 absColor  = abs(baseColor);
            
            lowp vec4 mixColor = mix(baseColor, absColor, gColorAbsMix);
            
            colorMain = mixColor * gColorMultiply + gColorAdd;
        }`;

        var lyapunovVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(lyapunovVS, vsLyapunovSource);
        gl.compileShader(lyapunovVS);

        if (!gl.getShaderParameter(lyapunovVS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(lyapunovVS));
        }

        var lyapunovFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(lyapunovFS, fsLyapunovSource);
        gl.compileShader(lyapunovFS);

        if(!gl.getShaderParameter(lyapunovFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(lyapunovFS));
        }

        lyapunovShaderProgram = gl.createProgram();
        gl.attachShader(lyapunovShaderProgram, lyapunovVS);
        gl.attachShader(lyapunovShaderProgram, lyapunovFS);
        gl.linkProgram(lyapunovShaderProgram);

        if (!gl.getProgramParameter(lyapunovShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(lyapunovShaderProgram));
        }

        var finalVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(finalVS, vsFinalSource);
        gl.compileShader(finalVS);

        if (!gl.getShaderParameter(finalVS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(finalVS));
        }

        var finalFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(finalFS, fsFinalSource);
        gl.compileShader(finalFS);

        if (!gl.getShaderParameter(finalFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(finalFS));
        }

        finalShaderProgram = gl.createProgram();
        gl.attachShader(finalShaderProgram, finalVS);
        gl.attachShader(finalShaderProgram, finalFS);
        gl.linkProgram(finalShaderProgram);

        if (!gl.getProgramParameter(finalShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(finalShaderProgram));
        }

        var resetVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(resetVS, vsResetSource);
        gl.compileShader(resetVS);

        if (!gl.getShaderParameter(resetVS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(resetVS));
        }

        var resetFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(resetFS, fsResetSource);
        gl.compileShader(resetFS);

        if (!gl.getShaderParameter(resetFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(resetFS));
        }

        resetShaderProgram = gl.createProgram();
        gl.attachShader(resetShaderProgram, resetVS);
        gl.attachShader(resetShaderProgram, resetFS);
        gl.linkProgram(resetShaderProgram);

        if (!gl.getProgramParameter(resetShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(resetShaderProgram));
        }

        var staticVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(staticVS, vsStaticSource);
        gl.compileShader(staticVS);

        if(!gl.getShaderParameter(staticVS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(staticVS));
        }

        var staticFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(staticFS, fsStaticSource);
        gl.compileShader(staticFS);

        if(!gl.getShaderParameter(staticFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(staticFS));
        }

        staticShaderProgram = gl.createProgram();
        gl.attachShader(staticShaderProgram, staticVS);
        gl.attachShader(staticShaderProgram, staticFS);
        gl.linkProgram(staticShaderProgram);

        if (!gl.getProgramParameter(staticShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(staticShaderProgram));
        }

        lyapunovPrevXTextureLocation      = gl.getUniformLocation(lyapunovShaderProgram, "gPrevX");
        lyapunovPrevLambdaTextureLocation = gl.getUniformLocation(lyapunovShaderProgram, "gPrevLambda");
        finalLambdaTextureLocation        = gl.getUniformLocation(finalShaderProgram,    "gLambdaTex");
    
        lyapunovSnUniformLocation    = gl.getUniformLocation(lyapunovShaderProgram, "gSn");
        lyapunovIndexUniformLocation = gl.getUniformLocation(lyapunovShaderProgram, "gIndex");
        resetSnUniformLocation       = gl.getUniformLocation(resetShaderProgram,    "gSn");

        resetScaleSpaceUniformLocation     = gl.getUniformLocation(resetShaderProgram, "gScale");
        resetTranslateSpaceUniformLocation = gl.getUniformLocation(resetShaderProgram, "gTranslate");

        lyapunovScaleSpaceUniformLocation     = gl.getUniformLocation(lyapunovShaderProgram, "gScale");
        lyapunovTranslateSpaceUniformLocation = gl.getUniformLocation(lyapunovShaderProgram, "gTranslate");

        colorMultiplyUniformLocation = gl.getUniformLocation(finalShaderProgram, "gColorMultiply");
        colorAddUniformLocation      = gl.getUniformLocation(finalShaderProgram, "gColorAdd");
        colorAbsMixUniformLocation   = gl.getUniformLocation(finalShaderProgram, "gColorAbsMix");

        relativeTranslateUniformLocation = gl.getUniformLocation(staticShaderProgram, "gRelativeTranslate");
    }

    function createBuffers()
    {
        const posArray = new Float32Array([-1.0, -1.0,  0.0,  1.0,
                                            1.0, -1.0,  0.0,  1.0,
                                           -1.0,  1.0,  0.0,  1.0,
                                            1.0,  1.0,  0.0,  1.0]);

        const abArray = new Float32Array([-1.0, -1.0,
                                           1.0, -1.0,
                                          -1.0,  1.0,
                                           1.0,  1.0]);

        const texArray = new Float32Array([0.0, 0.0,
                                           1.0, 0.0,
                                           0.0, 1.0,
                                           1.0, 1.0]);

        var attrib = 0;
        lyapunovVertexBuffer = gl.createVertexArray();
        gl.bindVertexArray(lyapunovVertexBuffer);

        attrib = gl.getAttribLocation(lyapunovShaderProgram, "vScreenPos");
        gl.enableVertexAttribArray(attrib);
        var posLyapunovBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posLyapunovBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(lyapunovShaderProgram, "vScreenAB");
        gl.enableVertexAttribArray(attrib);
        var abLyapunovBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, abLyapunovBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, abArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(lyapunovShaderProgram, "vScreenTex");
        gl.enableVertexAttribArray(attrib);
        var texLyapunovBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texLyapunovBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        finalVertexBuffer = gl.createVertexArray();
        gl.bindVertexArray(finalVertexBuffer);

        attrib = gl.getAttribLocation(finalShaderProgram, "vScreenPos");
        gl.enableVertexAttribArray(attrib);
        var posFinalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posFinalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(finalShaderProgram, "vScreenTex");
        gl.enableVertexAttribArray(attrib);
        var texFinalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texFinalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        resetVertexBuffer = gl.createVertexArray();
        gl.bindVertexArray(resetVertexBuffer);

        attrib = gl.getAttribLocation(resetShaderProgram, "vScreenPos");
        gl.enableVertexAttribArray(attrib);
        var posResetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posResetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(resetShaderProgram, "vScreenAB");
        gl.enableVertexAttribArray(attrib);
        var abResetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, abResetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, abArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        attrib = gl.getAttribLocation(resetShaderProgram, "vScreenTex");
        gl.enableVertexAttribArray(attrib);
        var texResetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texResetBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texArray, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);
    }

    function resetValues()
    {
        seqIndex   = 0;

        gl.viewport(0, 0, textureWidth, textureHeight);
        gl.bindVertexArray(resetVertexBuffer);

        gl.useProgram(resetShaderProgram);

        gl.bindFramebuffer(gl.FRAMEBUFFER, xLambdaFrameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, xTex2,      0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, lambdaTex2, 0);

        gl.uniform1ui(resetSnUniformLocation, seqStr[seqIndex] === 'A' ? 0 : 1);

        gl.uniform2fv(resetScaleSpaceUniformLocation,     spaceScale);
        gl.uniform2fv(resetTranslateSpaceUniformLocation, spaceTranslate);

        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, null, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        swapBuffers();
    }

    function mainDraw()
    {
        var strIndex = seqIndex % seqStr.length;

        gl.viewport(0, 0, textureWidth, textureHeight);
        gl.bindVertexArray(lyapunovVertexBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, xLambdaFrameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, xTex2,      0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, lambdaTex2, 0);

        gl.useProgram(lyapunovShaderProgram);

        gl.uniform1ui(lyapunovSnUniformLocation, seqStr[strIndex] === 'A' ? 0 : 1);
        gl.uniform1ui(lyapunovIndexUniformLocation, seqIndex + 1);

        gl.uniform2fv(lyapunovScaleSpaceUniformLocation,     spaceScale);
        gl.uniform2fv(lyapunovTranslateSpaceUniformLocation, spaceTranslate);

        gl.uniform1i(lyapunovPrevXTextureLocation,      0);
        gl.uniform1i(lyapunovPrevLambdaTextureLocation, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, xTex1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.REPEAT);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, lambdaTex1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.REPEAT);

        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, null, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        swapBuffers();

        gl.useProgram(finalShaderProgram);

        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.viewport(0, 0, standardWidth, standardHeight);
        gl.bindVertexArray(finalVertexBuffer);

        gl.uniform1i(finalLambdaTextureLocation, 0);

        gl.uniform4fv(colorMultiplyUniformLocation, colorMultiply);
        gl.uniform4fv(colorAddUniformLocation,      colorAdd);
        gl.uniform4fv(colorAbsMixUniformLocation,   colorAbsMix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, lambdaTex1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.REPEAT);

        gl.drawBuffers([gl.BACK]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        seqIndex           = seqIndex + 1;
        currAnimationFrame = window.requestAnimationFrame(mainDraw);
    }

    function staticDraw()
    {
        gl.useProgram(staticShaderProgram);

        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.viewport(0, 0, standardWidth, standardHeight);
        gl.bindVertexArray(finalVertexBuffer);

        gl.uniform1i(finalLambdaTextureLocation, 0);

        gl.uniform4fv(colorMultiplyUniformLocation, colorMultiply);
        gl.uniform4fv(colorAddUniformLocation,      colorAdd);
        gl.uniform4fv(colorAbsMixUniformLocation,   colorAbsMix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, lambdaTex1);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.REPEAT);

        gl.drawBuffers([gl.BACK]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    //=================================================== Util functions ===================================================\\
    function swapBuffers()
    {
        var tmp = null;

        tmp = xTex1;
        xTex1 = xTex2;
        xTex2 = tmp;

        tmp = lambdaTex1;
        lambdaTex1 = lambdaTex2;
        lambdaTex2 = tmp;
    }
}