(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
  <p>This examples renders a spinning textured cube.</p>

 */

const regl = require('../regl')()
const mat4 = require('gl-mat4')

var cubePosition = [
  [-0.5, +0.5, +0.5], [+0.5, +0.5, +0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5], // positive z face.
  [+0.5, +0.5, +0.5], [+0.5, +0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], // positive x face
  [+0.5, +0.5, -0.5], [-0.5, +0.5, -0.5], [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], // negative z face
  [-0.5, +0.5, -0.5], [-0.5, +0.5, +0.5], [-0.5, -0.5, +0.5], [-0.5, -0.5, -0.5], // negative x face.
  [-0.5, +0.5, -0.5], [+0.5, +0.5, -0.5], [+0.5, +0.5, +0.5], [-0.5, +0.5, +0.5], // top face
  [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5]  // bottom face
]

var cubeUv = [
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // positive z face.
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // positive x face.
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // negative z face.
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // negative x face.
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // top face
  [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]  // bottom face
]

const cubeElements = [
  [2, 1, 0], [2, 0, 3],       // positive z face.
  [6, 5, 4], [6, 4, 7],       // positive x face.
  [10, 9, 8], [10, 8, 11],    // negative z face.
  [14, 13, 12], [14, 12, 15], // negative x face.
  [18, 17, 16], [18, 16, 19], // top face.
  [20, 21, 22], [23, 20, 22]  // bottom face
]

const drawCube = regl({
  frag: `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D tex;
  void main () {
    gl_FragColor = texture2D(tex,vUv);
  }`,
  vert: `
  precision mediump float;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  uniform mat4 projection, view;
  void main() {
    vUv = uv;
    gl_Position = projection * view * vec4(position, 1);
  }`,
  attributes: {
    position: cubePosition,
    uv: cubeUv
  },
  elements: cubeElements,
  uniforms: {
    view: ({tick}) => {
      const t = 0.01 * tick
      return mat4.lookAt([],
                         [5 * Math.cos(t), 2.5 * Math.sin(t), 5 * Math.sin(t)],
                         [0, 0.0, 0],
                         [0, 1, 0])
    },
    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective([],
                       Math.PI / 4,
                       viewportWidth / viewportHeight,
                       0.01,
                       10),
    tex: regl.prop('texture')
  }
})

require('resl')({
  manifest: {
    texture: {
      type: 'image',
      src: 'assets/lena.png',
      parser: (data) => regl.texture({
        data: data,
        mag: 'linear',
        min: 'linear'
      })
    }
  },
  onDone: ({texture}) => {
    regl.frame(() => {
      regl.clear({
        color: [0, 0, 0, 255],
        depth: 1
      })
      drawCube({texture})
    })
  }
})

},{"../regl":58,"gl-mat4":42,"resl":57}],2:[function(require,module,exports){
var GL_FLOAT = 5126

function AttributeRecord () {
  this.state = 0

  this.x = 0.0
  this.y = 0.0
  this.z = 0.0
  this.w = 0.0

  this.buffer = null
  this.size = 0
  this.normalized = false
  this.type = GL_FLOAT
  this.offset = 0
  this.stride = 0
  this.divisor = 0
}

module.exports = function wrapAttributeState (
  gl,
  extensions,
  limits,
  bufferState,
  stringStore) {
  var NUM_ATTRIBUTES = limits.maxAttributes
  var attributeBindings = new Array(NUM_ATTRIBUTES)
  for (var i = 0; i < NUM_ATTRIBUTES; ++i) {
    attributeBindings[i] = new AttributeRecord()
  }

  return {
    Record: AttributeRecord,
    scope: {},
    state: attributeBindings
  }
}

},{}],3:[function(require,module,exports){

var isTypedArray = require('./util/is-typed-array')
var isNDArrayLike = require('./util/is-ndarray')
var values = require('./util/values')
var pool = require('./util/pool')

var arrayTypes = require('./constants/arraytypes.json')
var bufferTypes = require('./constants/dtypes.json')
var usageTypes = require('./constants/usage.json')

var GL_STATIC_DRAW = 0x88E4
var GL_STREAM_DRAW = 0x88E0

var GL_UNSIGNED_BYTE = 5121
var GL_FLOAT = 5126

var DTYPES_SIZES = []
DTYPES_SIZES[5120] = 1 // int8
DTYPES_SIZES[5122] = 2 // int16
DTYPES_SIZES[5124] = 4 // int32
DTYPES_SIZES[5121] = 1 // uint8
DTYPES_SIZES[5123] = 2 // uint16
DTYPES_SIZES[5125] = 4 // uint32
DTYPES_SIZES[5126] = 4 // float32

function typedArrayCode (data) {
  return arrayTypes[Object.prototype.toString.call(data)] | 0
}

function copyArray (out, inp) {
  for (var i = 0; i < inp.length; ++i) {
    out[i] = inp[i]
  }
}

function transpose (
  result, data, shapeX, shapeY, strideX, strideY, offset) {
  var ptr = 0
  for (var i = 0; i < shapeX; ++i) {
    for (var j = 0; j < shapeY; ++j) {
      result[ptr++] = data[strideX * i + strideY * j + offset]
    }
  }
}

function flatten (result, data, dimension) {
  var ptr = 0
  for (var i = 0; i < data.length; ++i) {
    var v = data[i]
    for (var j = 0; j < dimension; ++j) {
      result[ptr++] = v[j]
    }
  }
}

module.exports = function wrapBufferState (gl, stats, config) {
  var bufferCount = 0
  var bufferSet = {}

  function REGLBuffer (type) {
    this.id = bufferCount++
    this.buffer = gl.createBuffer()
    this.type = type
    this.usage = GL_STATIC_DRAW
    this.byteLength = 0
    this.dimension = 1
    this.dtype = GL_UNSIGNED_BYTE

    this.persistentData = null

    if (config.profile) {
      this.stats = {size: 0}
    }
  }

  REGLBuffer.prototype.bind = function () {
    gl.bindBuffer(this.type, this.buffer)
  }

  REGLBuffer.prototype.destroy = function () {
    destroy(this)
  }

  var streamPool = []

  function createStream (type, data) {
    var buffer = streamPool.pop()
    if (!buffer) {
      buffer = new REGLBuffer(type)
    }
    buffer.bind()
    initBufferFromData(buffer, data, GL_STREAM_DRAW, 0, 1, false)
    return buffer
  }

  function destroyStream (stream) {
    streamPool.push(stream)
  }

  function initBufferFromTypedArray (buffer, data, usage) {
    buffer.byteLength = data.byteLength
    gl.bufferData(buffer.type, data, usage)
  }

  function initBufferFromData (buffer, data, usage, dtype, dimension, persist) {
    buffer.usage = usage
    if (Array.isArray(data)) {
      buffer.dtype = dtype || GL_FLOAT
      if (data.length > 0) {
        var flatData
        if (Array.isArray(data[0])) {
          buffer.dimension = data[0].length
          flatData = pool.allocType(
            buffer.dtype,
            data.length * buffer.dimension)
          flatten(flatData, data, buffer.dimension)
          initBufferFromTypedArray(buffer, flatData, usage)
          if (persist) {
            buffer.persistentData = flatData
          } else {
            pool.freeType(flatData)
          }
        } else if (typeof data[0] === 'number') {
          buffer.dimension = dimension
          var typedData = pool.allocType(buffer.dtype, data.length)
          copyArray(typedData, data)
          initBufferFromTypedArray(buffer, typedData, usage)
          if (persist) {
            buffer.persistentData = typedData
          } else {
            pool.freeType(typedData)
          }
        } else if (isTypedArray(data[0])) {
          buffer.dimension = data[0].length
          buffer.dtype = dtype || typedArrayCode(data[0]) || GL_FLOAT
          flatData = pool.allocType(
            buffer.dtype,
            data.length * buffer.dimension)
          flatten(flatData, data, buffer.dimension)
          initBufferFromTypedArray(buffer, flatData, usage)
          if (persist) {
            buffer.persistentData = flatData
          } else {
            pool.freeType(flatData)
          }
        } else {
          
        }
      }
    } else if (isTypedArray(data)) {
      buffer.dtype = dtype || typedArrayCode(data)
      buffer.dimension = dimension
      initBufferFromTypedArray(buffer, data, usage)
      if (persist) {
        buffer.persistentData = new Uint8Array(new Uint8Array(data.buffer))
      }
    } else if (isNDArrayLike(data)) {
      var shape = data.shape
      var stride = data.stride
      var offset = data.offset

      var shapeX = 0
      var shapeY = 0
      var strideX = 0
      var strideY = 0
      if (shape.length === 1) {
        shapeX = shape[0]
        shapeY = 1
        strideX = stride[0]
        strideY = 0
      } else if (shape.length === 2) {
        shapeX = shape[0]
        shapeY = shape[1]
        strideX = stride[0]
        strideY = stride[1]
      } else {
        
      }

      buffer.dtype = dtype || typedArrayCode(data.data) || GL_FLOAT
      buffer.dimension = shapeY

      var transposeData = pool.allocType(buffer.dtype, shapeX * shapeY)
      transpose(transposeData,
        data.data,
        shapeX, shapeY,
        strideX, strideY,
        offset)
      initBufferFromTypedArray(buffer, transposeData, usage)
      if (persist) {
        buffer.persistentData = transposeData
      } else {
        pool.freeType(transposeData)
      }
    } else {
      
    }
  }

  function destroy (buffer) {
    stats.bufferCount--

    var handle = buffer.buffer
    
    gl.deleteBuffer(handle)
    buffer.buffer = null
    delete bufferSet[buffer.id]
  }

  function createBuffer (options, type, deferInit, persistent) {
    stats.bufferCount++

    var buffer = new REGLBuffer(type)
    bufferSet[buffer.id] = buffer

    function reglBuffer (options) {
      var usage = GL_STATIC_DRAW
      var data = null
      var byteLength = 0
      var dtype = 0
      var dimension = 1
      if (Array.isArray(options) ||
          isTypedArray(options) ||
          isNDArrayLike(options)) {
        data = options
      } else if (typeof options === 'number') {
        byteLength = options | 0
      } else if (options) {
        

        if ('data' in options) {
          
          data = options.data
        }

        if ('usage' in options) {
          
          usage = usageTypes[options.usage]
        }

        if ('type' in options) {
          
          dtype = bufferTypes[options.type]
        }

        if ('dimension' in options) {
          
          dimension = options.dimension | 0
        }

        if ('length' in options) {
          
          byteLength = options.length | 0
        }
      }

      buffer.bind()
      if (!data) {
        gl.bufferData(buffer.type, byteLength, usage)
        buffer.dtype = dtype || GL_UNSIGNED_BYTE
        buffer.usage = usage
        buffer.dimension = dimension
        buffer.byteLength = byteLength
      } else {
        initBufferFromData(buffer, data, usage, dtype, dimension, persistent)
      }

      if (config.profile) {
        buffer.stats.size = buffer.byteLength * DTYPES_SIZES[buffer.dtype]
      }

      return reglBuffer
    }

    function setSubData (data, offset) {
      

      gl.bufferSubData(buffer.type, offset, data)
    }

    function subdata (data, offset_) {
      var offset = (offset_ || 0) | 0
      buffer.bind()
      if (Array.isArray(data)) {
        if (data.length > 0) {
          if (typeof data[0] === 'number') {
            var converted = pool.allocType(buffer.dtype, data.length)
            copyArray(converted, data)
            setSubData(converted, offset)
            pool.freeType(converted)
          } else if (Array.isArray(data[0]) || isTypedArray(data[0])) {
            var dimension = data[0].length
            var flatData = pool.allocType(buffer.dtype, data.length * dimension)
            flatten(flatData, data, dimension)
            setSubData(flatData, offset)
            pool.freeType(flatData)
          } else {
            
          }
        }
      } else if (isTypedArray(data)) {
        setSubData(data, offset)
      } else if (isNDArrayLike(data)) {
        var shape = data.shape
        var stride = data.stride

        var shapeX = 0
        var shapeY = 0
        var strideX = 0
        var strideY = 0
        if (shape.length === 1) {
          shapeX = shape[0]
          shapeY = 1
          strideX = stride[0]
          strideY = 0
        } else if (shape.length === 2) {
          shapeX = shape[0]
          shapeY = shape[1]
          strideX = stride[0]
          strideY = stride[1]
        } else {
          
        }
        var dtype = Array.isArray(data.data)
          ? buffer.dtype
          : typedArrayCode(data.data)

        var transposeData = pool.allocType(dtype, shapeX * shapeY)
        transpose(transposeData,
          data.data,
          shapeX, shapeY,
          strideX, strideY,
          data.offset)
        setSubData(transposeData, offset)
        pool.freeType(transposeData)
      } else {
        
      }
      return reglBuffer
    }

    if (!deferInit) {
      reglBuffer(options)
    }

    reglBuffer._reglType = 'buffer'
    reglBuffer._buffer = buffer
    reglBuffer.subdata = subdata
    if (config.profile) {
      reglBuffer.stats = buffer.stats
    }
    reglBuffer.destroy = function () { destroy(buffer) }

    return reglBuffer
  }

  function restoreBuffers () {
    values(bufferSet).forEach(function (buffer) {
      buffer.buffer = gl.createBuffer()
      gl.bindBuffer(buffer.type, buffer.buffer)
      gl.bufferData(
        buffer.type, buffer.persistentData || buffer.byteLength, buffer.usage)
    })
  }

  if (config.profile) {
    stats.getTotalBufferSize = function () {
      var total = 0
      // TODO: Right now, the streams are not part of the total count.
      Object.keys(bufferSet).forEach(function (key) {
        total += bufferSet[key].stats.size
      })
      return total
    }
  }

  return {
    create: createBuffer,

    createStream: createStream,
    destroyStream: destroyStream,

    clear: function () {
      values(bufferSet).forEach(destroy)
      streamPool.forEach(destroy)
    },

    getBuffer: function (wrapper) {
      if (wrapper && wrapper._buffer instanceof REGLBuffer) {
        return wrapper._buffer
      }
      return null
    },

    restore: restoreBuffers,

    _initBuffer: initBufferFromData
  }
}

},{"./constants/arraytypes.json":4,"./constants/dtypes.json":5,"./constants/usage.json":7,"./util/is-ndarray":25,"./util/is-typed-array":26,"./util/pool":28,"./util/values":31}],4:[function(require,module,exports){
module.exports={
  "[object Int8Array]": 5120
, "[object Int16Array]": 5122
, "[object Int32Array]": 5124
, "[object Uint8Array]": 5121
, "[object Uint8ClampedArray]": 5121
, "[object Uint16Array]": 5123
, "[object Uint32Array]": 5125
, "[object Float32Array]": 5126
, "[object Float64Array]": 5121
, "[object ArrayBuffer]": 5121
}

},{}],5:[function(require,module,exports){
module.exports={
  "int8": 5120
, "int16": 5122
, "int32": 5124
, "uint8": 5121
, "uint16": 5123
, "uint32": 5125
, "float": 5126
, "float32": 5126
}

},{}],6:[function(require,module,exports){
module.exports={
  "points": 0,
  "point": 0,
  "lines": 1,
  "line": 1,
  "line loop": 2,
  "line strip": 3,
  "triangles": 4,
  "triangle": 4,
  "triangle strip": 5,
  "triangle fan": 6
}

},{}],7:[function(require,module,exports){
module.exports={
  "static": 35044,
  "dynamic": 35048,
  "stream": 35040
}

},{}],8:[function(require,module,exports){

var createEnvironment = require('./util/codegen')
var loop = require('./util/loop')
var isTypedArray = require('./util/is-typed-array')
var isNDArray = require('./util/is-ndarray')
var isArrayLike = require('./util/is-array-like')
var dynamic = require('./dynamic')

var primTypes = require('./constants/primitives.json')
var glTypes = require('./constants/dtypes.json')

// "cute" names for vector components
var CUTE_COMPONENTS = 'xyzw'.split('')

var GL_UNSIGNED_BYTE = 5121

var ATTRIB_STATE_POINTER = 1
var ATTRIB_STATE_CONSTANT = 2

var DYN_FUNC = 0
var DYN_PROP = 1
var DYN_CONTEXT = 2
var DYN_STATE = 3
var DYN_THUNK = 4

var S_DITHER = 'dither'
var S_BLEND_ENABLE = 'blend.enable'
var S_BLEND_COLOR = 'blend.color'
var S_BLEND_EQUATION = 'blend.equation'
var S_BLEND_FUNC = 'blend.func'
var S_DEPTH_ENABLE = 'depth.enable'
var S_DEPTH_FUNC = 'depth.func'
var S_DEPTH_RANGE = 'depth.range'
var S_DEPTH_MASK = 'depth.mask'
var S_COLOR_MASK = 'colorMask'
var S_CULL_ENABLE = 'cull.enable'
var S_CULL_FACE = 'cull.face'
var S_FRONT_FACE = 'frontFace'
var S_LINE_WIDTH = 'lineWidth'
var S_POLYGON_OFFSET_ENABLE = 'polygonOffset.enable'
var S_POLYGON_OFFSET_OFFSET = 'polygonOffset.offset'
var S_SAMPLE_ALPHA = 'sample.alpha'
var S_SAMPLE_ENABLE = 'sample.enable'
var S_SAMPLE_COVERAGE = 'sample.coverage'
var S_STENCIL_ENABLE = 'stencil.enable'
var S_STENCIL_MASK = 'stencil.mask'
var S_STENCIL_FUNC = 'stencil.func'
var S_STENCIL_OPFRONT = 'stencil.opFront'
var S_STENCIL_OPBACK = 'stencil.opBack'
var S_SCISSOR_ENABLE = 'scissor.enable'
var S_SCISSOR_BOX = 'scissor.box'
var S_VIEWPORT = 'viewport'

var S_PROFILE = 'profile'

var S_FRAMEBUFFER = 'framebuffer'
var S_VERT = 'vert'
var S_FRAG = 'frag'
var S_ELEMENTS = 'elements'
var S_PRIMITIVE = 'primitive'
var S_COUNT = 'count'
var S_OFFSET = 'offset'
var S_INSTANCES = 'instances'

var SUFFIX_WIDTH = 'Width'
var SUFFIX_HEIGHT = 'Height'

var S_FRAMEBUFFER_WIDTH = S_FRAMEBUFFER + SUFFIX_WIDTH
var S_FRAMEBUFFER_HEIGHT = S_FRAMEBUFFER + SUFFIX_HEIGHT
var S_VIEWPORT_WIDTH = S_VIEWPORT + SUFFIX_WIDTH
var S_VIEWPORT_HEIGHT = S_VIEWPORT + SUFFIX_HEIGHT
var S_DRAWINGBUFFER = 'drawingBuffer'
var S_DRAWINGBUFFER_WIDTH = S_DRAWINGBUFFER + SUFFIX_WIDTH
var S_DRAWINGBUFFER_HEIGHT = S_DRAWINGBUFFER + SUFFIX_HEIGHT

var NESTED_OPTIONS = [
  S_BLEND_FUNC,
  S_BLEND_EQUATION,
  S_STENCIL_FUNC,
  S_STENCIL_OPFRONT,
  S_STENCIL_OPBACK,
  S_SAMPLE_COVERAGE,
  S_VIEWPORT,
  S_SCISSOR_BOX,
  S_POLYGON_OFFSET_OFFSET
]

var GL_ARRAY_BUFFER = 34962
var GL_ELEMENT_ARRAY_BUFFER = 34963

var GL_FRAGMENT_SHADER = 35632
var GL_VERTEX_SHADER = 35633

var GL_TEXTURE_2D = 0x0DE1
var GL_TEXTURE_CUBE_MAP = 0x8513

var GL_CULL_FACE = 0x0B44
var GL_BLEND = 0x0BE2
var GL_DITHER = 0x0BD0
var GL_STENCIL_TEST = 0x0B90
var GL_DEPTH_TEST = 0x0B71
var GL_SCISSOR_TEST = 0x0C11
var GL_POLYGON_OFFSET_FILL = 0x8037
var GL_SAMPLE_ALPHA_TO_COVERAGE = 0x809E
var GL_SAMPLE_COVERAGE = 0x80A0

var GL_FLOAT = 5126
var GL_FLOAT_VEC2 = 35664
var GL_FLOAT_VEC3 = 35665
var GL_FLOAT_VEC4 = 35666
var GL_INT = 5124
var GL_INT_VEC2 = 35667
var GL_INT_VEC3 = 35668
var GL_INT_VEC4 = 35669
var GL_BOOL = 35670
var GL_BOOL_VEC2 = 35671
var GL_BOOL_VEC3 = 35672
var GL_BOOL_VEC4 = 35673
var GL_FLOAT_MAT2 = 35674
var GL_FLOAT_MAT3 = 35675
var GL_FLOAT_MAT4 = 35676
var GL_SAMPLER_2D = 35678
var GL_SAMPLER_CUBE = 35680

var GL_TRIANGLES = 4

var GL_FRONT = 1028
var GL_BACK = 1029
var GL_CW = 0x0900
var GL_CCW = 0x0901
var GL_MIN_EXT = 0x8007
var GL_MAX_EXT = 0x8008
var GL_ALWAYS = 519
var GL_KEEP = 7680
var GL_ZERO = 0
var GL_ONE = 1
var GL_FUNC_ADD = 0x8006
var GL_LESS = 513

var GL_FRAMEBUFFER = 0x8D40
var GL_COLOR_ATTACHMENT0 = 0x8CE0

var blendFuncs = {
  '0': 0,
  '1': 1,
  'zero': 0,
  'one': 1,
  'src color': 768,
  'one minus src color': 769,
  'src alpha': 770,
  'one minus src alpha': 771,
  'dst color': 774,
  'one minus dst color': 775,
  'dst alpha': 772,
  'one minus dst alpha': 773,
  'constant color': 32769,
  'one minus constant color': 32770,
  'constant alpha': 32771,
  'one minus constant alpha': 32772,
  'src alpha saturate': 776
}

// There are invalid values for srcRGB and dstRGB. See:
// https://www.khronos.org/registry/webgl/specs/1.0/#6.13
// https://github.com/KhronosGroup/WebGL/blob/0d3201f5f7ec3c0060bc1f04077461541f1987b9/conformance-suites/1.0.3/conformance/misc/webgl-specific.html#L56
var invalidBlendCombinations = [
  'constant color, constant alpha',
  'one minus constant color, constant alpha',
  'constant color, one minus constant alpha',
  'one minus constant color, one minus constant alpha',
  'constant alpha, constant color',
  'constant alpha, one minus constant color',
  'one minus constant alpha, constant color',
  'one minus constant alpha, one minus constant color'
]

var compareFuncs = {
  'never': 512,
  'less': 513,
  '<': 513,
  'equal': 514,
  '=': 514,
  '==': 514,
  '===': 514,
  'lequal': 515,
  '<=': 515,
  'greater': 516,
  '>': 516,
  'notequal': 517,
  '!=': 517,
  '!==': 517,
  'gequal': 518,
  '>=': 518,
  'always': 519
}

var stencilOps = {
  '0': 0,
  'zero': 0,
  'keep': 7680,
  'replace': 7681,
  'increment': 7682,
  'decrement': 7683,
  'increment wrap': 34055,
  'decrement wrap': 34056,
  'invert': 5386
}

var shaderType = {
  'frag': GL_FRAGMENT_SHADER,
  'vert': GL_VERTEX_SHADER
}

var orientationType = {
  'cw': GL_CW,
  'ccw': GL_CCW
}

function isBufferArgs (x) {
  return Array.isArray(x) ||
    isTypedArray(x) ||
    isNDArray(x)
}

// Make sure viewport is processed first
function sortState (state) {
  return state.sort(function (a, b) {
    if (a === S_VIEWPORT) {
      return -1
    } else if (b === S_VIEWPORT) {
      return 1
    }
    return (a < b) ? -1 : 1
  })
}

function Declaration (thisDep, contextDep, propDep, append) {
  this.thisDep = thisDep
  this.contextDep = contextDep
  this.propDep = propDep
  this.append = append
}

function isStatic (decl) {
  return decl && !(decl.thisDep || decl.contextDep || decl.propDep)
}

function createStaticDecl (append) {
  return new Declaration(false, false, false, append)
}

function createDynamicDecl (dyn, append) {
  var type = dyn.type
  if (type === DYN_FUNC) {
    var numArgs = dyn.data.length
    return new Declaration(
      true,
      numArgs >= 1,
      numArgs >= 2,
      append)
  } else if (type === DYN_THUNK) {
    var data = dyn.data
    return new Declaration(
      data.thisDep,
      data.contextDep,
      data.propDep,
      append)
  } else {
    return new Declaration(
      type === DYN_STATE,
      type === DYN_CONTEXT,
      type === DYN_PROP,
      append)
  }
}

var SCOPE_DECL = new Declaration(false, false, false, function () {})

module.exports = function reglCore (
  gl,
  stringStore,
  extensions,
  limits,
  bufferState,
  elementState,
  textureState,
  framebufferState,
  uniformState,
  attributeState,
  shaderState,
  drawState,
  contextState,
  timer,
  config) {
  var AttributeRecord = attributeState.Record

  var blendEquations = {
    'add': 32774,
    'subtract': 32778,
    'reverse subtract': 32779
  }
  if (extensions.ext_blend_minmax) {
    blendEquations.min = GL_MIN_EXT
    blendEquations.max = GL_MAX_EXT
  }

  var extInstancing = extensions.angle_instanced_arrays
  var extDrawBuffers = extensions.webgl_draw_buffers

  // ===================================================
  // ===================================================
  // WEBGL STATE
  // ===================================================
  // ===================================================
  var currentState = {
    dirty: true,
    profile: config.profile
  }
  var nextState = {}
  var GL_STATE_NAMES = []
  var GL_FLAGS = {}
  var GL_VARIABLES = {}

  function propName (name) {
    return name.replace('.', '_')
  }

  function stateFlag (sname, cap, init) {
    var name = propName(sname)
    GL_STATE_NAMES.push(sname)
    nextState[name] = currentState[name] = !!init
    GL_FLAGS[name] = cap
  }

  function stateVariable (sname, func, init) {
    var name = propName(sname)
    GL_STATE_NAMES.push(sname)
    if (Array.isArray(init)) {
      currentState[name] = init.slice()
      nextState[name] = init.slice()
    } else {
      currentState[name] = nextState[name] = init
    }
    GL_VARIABLES[name] = func
  }

  // Dithering
  stateFlag(S_DITHER, GL_DITHER)

  // Blending
  stateFlag(S_BLEND_ENABLE, GL_BLEND)
  stateVariable(S_BLEND_COLOR, 'blendColor', [0, 0, 0, 0])
  stateVariable(S_BLEND_EQUATION, 'blendEquationSeparate',
    [GL_FUNC_ADD, GL_FUNC_ADD])
  stateVariable(S_BLEND_FUNC, 'blendFuncSeparate',
    [GL_ONE, GL_ZERO, GL_ONE, GL_ZERO])

  // Depth
  stateFlag(S_DEPTH_ENABLE, GL_DEPTH_TEST, true)
  stateVariable(S_DEPTH_FUNC, 'depthFunc', GL_LESS)
  stateVariable(S_DEPTH_RANGE, 'depthRange', [0, 1])
  stateVariable(S_DEPTH_MASK, 'depthMask', true)

  // Color mask
  stateVariable(S_COLOR_MASK, S_COLOR_MASK, [true, true, true, true])

  // Face culling
  stateFlag(S_CULL_ENABLE, GL_CULL_FACE)
  stateVariable(S_CULL_FACE, 'cullFace', GL_BACK)

  // Front face orientation
  stateVariable(S_FRONT_FACE, S_FRONT_FACE, GL_CCW)

  // Line width
  stateVariable(S_LINE_WIDTH, S_LINE_WIDTH, 1)

  // Polygon offset
  stateFlag(S_POLYGON_OFFSET_ENABLE, GL_POLYGON_OFFSET_FILL)
  stateVariable(S_POLYGON_OFFSET_OFFSET, 'polygonOffset', [0, 0])

  // Sample coverage
  stateFlag(S_SAMPLE_ALPHA, GL_SAMPLE_ALPHA_TO_COVERAGE)
  stateFlag(S_SAMPLE_ENABLE, GL_SAMPLE_COVERAGE)
  stateVariable(S_SAMPLE_COVERAGE, 'sampleCoverage', [1, false])

  // Stencil
  stateFlag(S_STENCIL_ENABLE, GL_STENCIL_TEST)
  stateVariable(S_STENCIL_MASK, 'stencilMask', -1)
  stateVariable(S_STENCIL_FUNC, 'stencilFunc', [GL_ALWAYS, 0, -1])
  stateVariable(S_STENCIL_OPFRONT, 'stencilOpSeparate',
    [GL_FRONT, GL_KEEP, GL_KEEP, GL_KEEP])
  stateVariable(S_STENCIL_OPBACK, 'stencilOpSeparate',
    [GL_BACK, GL_KEEP, GL_KEEP, GL_KEEP])

  // Scissor
  stateFlag(S_SCISSOR_ENABLE, GL_SCISSOR_TEST)
  stateVariable(S_SCISSOR_BOX, 'scissor',
    [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight])

  // Viewport
  stateVariable(S_VIEWPORT, S_VIEWPORT,
    [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight])

  // ===================================================
  // ===================================================
  // ENVIRONMENT
  // ===================================================
  // ===================================================
  var sharedState = {
    gl: gl,
    context: contextState,
    strings: stringStore,
    next: nextState,
    current: currentState,
    draw: drawState,
    elements: elementState,
    buffer: bufferState,
    shader: shaderState,
    attributes: attributeState.state,
    uniforms: uniformState,
    framebuffer: framebufferState,
    extensions: extensions,

    timer: timer,
    isBufferArgs: isBufferArgs
  }

  var sharedConstants = {
    primTypes: primTypes,
    compareFuncs: compareFuncs,
    blendFuncs: blendFuncs,
    blendEquations: blendEquations,
    stencilOps: stencilOps,
    glTypes: glTypes,
    orientationType: orientationType
  }

  

  if (extDrawBuffers) {
    sharedConstants.backBuffer = [GL_BACK]
    sharedConstants.drawBuffer = loop(limits.maxDrawbuffers, function (i) {
      if (i === 0) {
        return [0]
      }
      return loop(i, function (j) {
        return GL_COLOR_ATTACHMENT0 + j
      })
    })
  }

  var drawCallCounter = 0
  function createREGLEnvironment () {
    var env = createEnvironment()
    var link = env.link
    var global = env.global
    env.id = drawCallCounter++

    env.batchId = '0'

    // link shared state
    var SHARED = link(sharedState)
    var shared = env.shared = {
      props: 'a0'
    }
    Object.keys(sharedState).forEach(function (prop) {
      shared[prop] = global.def(SHARED, '.', prop)
    })

    // Inject runtime assertion stuff for debug builds
    

    // Copy GL state variables over
    var nextVars = env.next = {}
    var currentVars = env.current = {}
    Object.keys(GL_VARIABLES).forEach(function (variable) {
      if (Array.isArray(currentState[variable])) {
        nextVars[variable] = global.def(shared.next, '.', variable)
        currentVars[variable] = global.def(shared.current, '.', variable)
      }
    })

    // Initialize shared constants
    var constants = env.constants = {}
    Object.keys(sharedConstants).forEach(function (name) {
      constants[name] = global.def(JSON.stringify(sharedConstants[name]))
    })

    // Helper function for calling a block
    env.invoke = function (block, x) {
      switch (x.type) {
        case DYN_FUNC:
          var argList = [
            'this',
            shared.context,
            shared.props,
            env.batchId
          ]
          return block.def(
            link(x.data), '.call(',
              argList.slice(0, Math.max(x.data.length + 1, 4)),
             ')')
        case DYN_PROP:
          return block.def(shared.props, x.data)
        case DYN_CONTEXT:
          return block.def(shared.context, x.data)
        case DYN_STATE:
          return block.def('this', x.data)
        case DYN_THUNK:
          x.data.append(env, block)
          return x.data.ref
      }
    }

    env.attribCache = {}

    var scopeAttribs = {}
    env.scopeAttrib = function (name) {
      var id = stringStore.id(name)
      if (id in scopeAttribs) {
        return scopeAttribs[id]
      }
      var binding = attributeState.scope[id]
      if (!binding) {
        binding = attributeState.scope[id] = new AttributeRecord()
      }
      var result = scopeAttribs[id] = link(binding)
      return result
    }

    return env
  }

  // ===================================================
  // ===================================================
  // PARSING
  // ===================================================
  // ===================================================
  function parseProfile (options) {
    var staticOptions = options.static
    var dynamicOptions = options.dynamic

    var profileEnable
    if (S_PROFILE in staticOptions) {
      var value = !!staticOptions[S_PROFILE]
      profileEnable = createStaticDecl(function (env, scope) {
        return value
      })
      profileEnable.enable = value
    } else if (S_PROFILE in dynamicOptions) {
      var dyn = dynamicOptions[S_PROFILE]
      profileEnable = createDynamicDecl(dyn, function (env, scope) {
        return env.invoke(scope, dyn)
      })
    }

    return profileEnable
  }

  function parseFramebuffer (options, env) {
    var staticOptions = options.static
    var dynamicOptions = options.dynamic

    if (S_FRAMEBUFFER in staticOptions) {
      var framebuffer = staticOptions[S_FRAMEBUFFER]
      if (framebuffer) {
        framebuffer = framebufferState.getFramebuffer(framebuffer)
        
        return createStaticDecl(function (env, block) {
          var FRAMEBUFFER = env.link(framebuffer)
          var shared = env.shared
          block.set(
            shared.framebuffer,
            '.next',
            FRAMEBUFFER)
          var CONTEXT = shared.context
          block.set(
            CONTEXT,
            '.' + S_FRAMEBUFFER_WIDTH,
            FRAMEBUFFER + '.width')
          block.set(
            CONTEXT,
            '.' + S_FRAMEBUFFER_HEIGHT,
            FRAMEBUFFER + '.height')
          return FRAMEBUFFER
        })
      } else {
        return createStaticDecl(function (env, scope) {
          var shared = env.shared
          scope.set(
            shared.framebuffer,
            '.next',
            'null')
          var CONTEXT = shared.context
          scope.set(
            CONTEXT,
            '.' + S_FRAMEBUFFER_WIDTH,
            CONTEXT + '.' + S_DRAWINGBUFFER_WIDTH)
          scope.set(
            CONTEXT,
            '.' + S_FRAMEBUFFER_HEIGHT,
            CONTEXT + '.' + S_DRAWINGBUFFER_HEIGHT)
          return 'null'
        })
      }
    } else if (S_FRAMEBUFFER in dynamicOptions) {
      var dyn = dynamicOptions[S_FRAMEBUFFER]
      return createDynamicDecl(dyn, function (env, scope) {
        var FRAMEBUFFER_FUNC = env.invoke(scope, dyn)
        var shared = env.shared
        var FRAMEBUFFER_STATE = shared.framebuffer
        var FRAMEBUFFER = scope.def(
          FRAMEBUFFER_STATE, '.getFramebuffer(', FRAMEBUFFER_FUNC, ')')

        

        scope.set(
          FRAMEBUFFER_STATE,
          '.next',
          FRAMEBUFFER)
        var CONTEXT = shared.context
        scope.set(
          CONTEXT,
          '.' + S_FRAMEBUFFER_WIDTH,
          FRAMEBUFFER + '?' + FRAMEBUFFER + '.width:' +
          CONTEXT + '.' + S_DRAWINGBUFFER_WIDTH)
        scope.set(
          CONTEXT,
          '.' + S_FRAMEBUFFER_HEIGHT,
          FRAMEBUFFER +
          '?' + FRAMEBUFFER + '.height:' +
          CONTEXT + '.' + S_DRAWINGBUFFER_HEIGHT)
        return FRAMEBUFFER
      })
    } else {
      return null
    }
  }

  function parseViewportScissor (options, framebuffer, env) {
    var staticOptions = options.static
    var dynamicOptions = options.dynamic

    function parseBox (param) {
      if (param in staticOptions) {
        var box = staticOptions[param]
        

        var isStatic = true
        var x = box.x | 0
        var y = box.y | 0
        
        var w, h
        if ('width' in box) {
          w = box.width | 0
          
        } else {
          isStatic = false
        }
        if ('height' in box) {
          h = box.height | 0
          
        } else {
          isStatic = false
        }

        return new Declaration(
          !isStatic && framebuffer && framebuffer.thisDep,
          !isStatic && framebuffer && framebuffer.contextDep,
          !isStatic && framebuffer && framebuffer.propDep,
          function (env, scope) {
            var CONTEXT = env.shared.context
            var BOX_W = w
            if (!('width' in box)) {
              BOX_W = scope.def(CONTEXT, '.', S_FRAMEBUFFER_WIDTH, '-', x)
            } else {
              
            }
            var BOX_H = h
            if (!('height' in box)) {
              BOX_H = scope.def(CONTEXT, '.', S_FRAMEBUFFER_HEIGHT, '-', y)
            } else {
              
            }
            return [x, y, BOX_W, BOX_H]
          })
      } else if (param in dynamicOptions) {
        var dynBox = dynamicOptions[param]
        var result = createDynamicDecl(dynBox, function (env, scope) {
          var BOX = env.invoke(scope, dynBox)

          

          var CONTEXT = env.shared.context
          var BOX_X = scope.def(BOX, '.x|0')
          var BOX_Y = scope.def(BOX, '.y|0')
          var BOX_W = scope.def(
            '"width" in ', BOX, '?', BOX, '.width|0:',
            '(', CONTEXT, '.', S_FRAMEBUFFER_WIDTH, '-', BOX_X, ')')
          var BOX_H = scope.def(
            '"height" in ', BOX, '?', BOX, '.height|0:',
            '(', CONTEXT, '.', S_FRAMEBUFFER_HEIGHT, '-', BOX_Y, ')')

          

          return [BOX_X, BOX_Y, BOX_W, BOX_H]
        })
        if (framebuffer) {
          result.thisDep = result.thisDep || framebuffer.thisDep
          result.contextDep = result.contextDep || framebuffer.contextDep
          result.propDep = result.propDep || framebuffer.propDep
        }
        return result
      } else if (framebuffer) {
        return new Declaration(
          framebuffer.thisDep,
          framebuffer.contextDep,
          framebuffer.propDep,
          function (env, scope) {
            var CONTEXT = env.shared.context
            return [
              0, 0,
              scope.def(CONTEXT, '.', S_FRAMEBUFFER_WIDTH),
              scope.def(CONTEXT, '.', S_FRAMEBUFFER_HEIGHT)]
          })
      } else {
        return null
      }
    }

    var viewport = parseBox(S_VIEWPORT)

    if (viewport) {
      var prevViewport = viewport
      viewport = new Declaration(
        viewport.thisDep,
        viewport.contextDep,
        viewport.propDep,
        function (env, scope) {
          var VIEWPORT = prevViewport.append(env, scope)
          var CONTEXT = env.shared.context
          scope.set(
            CONTEXT,
            '.' + S_VIEWPORT_WIDTH,
            VIEWPORT[2])
          scope.set(
            CONTEXT,
            '.' + S_VIEWPORT_HEIGHT,
            VIEWPORT[3])
          return VIEWPORT
        })
    }

    return {
      viewport: viewport,
      scissor_box: parseBox(S_SCISSOR_BOX)
    }
  }

  function parseProgram (options) {
    var staticOptions = options.static
    var dynamicOptions = options.dynamic

    function parseShader (name) {
      if (name in staticOptions) {
        var id = stringStore.id(staticOptions[name])
        
        var result = createStaticDecl(function () {
          return id
        })
        result.id = id
        return result
      } else if (name in dynamicOptions) {
        var dyn = dynamicOptions[name]
        return createDynamicDecl(dyn, function (env, scope) {
          var str = env.invoke(scope, dyn)
          var id = scope.def(env.shared.strings, '.id(', str, ')')
          
          return id
        })
      }
      return null
    }

    var frag = parseShader(S_FRAG)
    var vert = parseShader(S_VERT)

    var program = null
    var progVar
    if (isStatic(frag) && isStatic(vert)) {
      program = shaderState.program(vert.id, frag.id)
      progVar = createStaticDecl(function (env, scope) {
        return env.link(program)
      })
    } else {
      progVar = new Declaration(
        (frag && frag.thisDep) || (vert && vert.thisDep),
        (frag && frag.contextDep) || (vert && vert.contextDep),
        (frag && frag.propDep) || (vert && vert.propDep),
        function (env, scope) {
          var SHADER_STATE = env.shared.shader
          var fragId
          if (frag) {
            fragId = frag.append(env, scope)
          } else {
            fragId = scope.def(SHADER_STATE, '.', S_FRAG)
          }
          var vertId
          if (vert) {
            vertId = vert.append(env, scope)
          } else {
            vertId = scope.def(SHADER_STATE, '.', S_VERT)
          }
          var progDef = SHADER_STATE + '.program(' + vertId + ',' + fragId
          
          return scope.def(progDef + ')')
        })
    }

    return {
      frag: frag,
      vert: vert,
      progVar: progVar,
      program: program
    }
  }

  function parseDraw (options, env) {
    var staticOptions = options.static
    var dynamicOptions = options.dynamic

    function parseElements () {
      if (S_ELEMENTS in staticOptions) {
        var elements = staticOptions[S_ELEMENTS]
        if (isBufferArgs(elements)) {
          elements = elementState.getElements(elementState.create(elements, true))
        } else if (elements) {
          elements = elementState.getElements(elements)
          
        }
        var result = createStaticDecl(function (env, scope) {
          if (elements) {
            var result = env.link(elements)
            env.ELEMENTS = result
            return result
          }
          env.ELEMENTS = null
          return null
        })
        result.value = elements
        return result
      } else if (S_ELEMENTS in dynamicOptions) {
        var dyn = dynamicOptions[S_ELEMENTS]
        return createDynamicDecl(dyn, function (env, scope) {
          var shared = env.shared

          var IS_BUFFER_ARGS = shared.isBufferArgs
          var ELEMENT_STATE = shared.elements

          var elementDefn = env.invoke(scope, dyn)
          var elements = scope.def('null')
          var elementStream = scope.def(IS_BUFFER_ARGS, '(', elementDefn, ')')

          var ifte = env.cond(elementStream)
            .then(elements, '=', ELEMENT_STATE, '.createStream(', elementDefn, ');')
            .else(elements, '=', ELEMENT_STATE, '.getElements(', elementDefn, ');')

          

          scope.entry(ifte)
          scope.exit(
            env.cond(elementStream)
              .then(ELEMENT_STATE, '.destroyStream(', elements, ');'))

          env.ELEMENTS = elements

          return elements
        })
      }

      return null
    }

    var elements = parseElements()

    function parsePrimitive () {
      if (S_PRIMITIVE in staticOptions) {
        var primitive = staticOptions[S_PRIMITIVE]
        
        return createStaticDecl(function (env, scope) {
          return primTypes[primitive]
        })
      } else if (S_PRIMITIVE in dynamicOptions) {
        var dynPrimitive = dynamicOptions[S_PRIMITIVE]
        return createDynamicDecl(dynPrimitive, function (env, scope) {
          var PRIM_TYPES = env.constants.primTypes
          var prim = env.invoke(scope, dynPrimitive)
          
          return scope.def(PRIM_TYPES, '[', prim, ']')
        })
      } else if (elements) {
        if (isStatic(elements)) {
          if (elements.value) {
            return createStaticDecl(function (env, scope) {
              return scope.def(env.ELEMENTS, '.primType')
            })
          } else {
            return createStaticDecl(function () {
              return GL_TRIANGLES
            })
          }
        } else {
          return new Declaration(
            elements.thisDep,
            elements.contextDep,
            elements.propDep,
            function (env, scope) {
              var elements = env.ELEMENTS
              return scope.def(elements, '?', elements, '.primType:', GL_TRIANGLES)
            })
        }
      }
      return null
    }

    function parseParam (param, isOffset) {
      if (param in staticOptions) {
        var value = staticOptions[param] | 0
        
        return createStaticDecl(function (env, scope) {
          if (isOffset) {
            env.OFFSET = value
          }
          return value
        })
      } else if (param in dynamicOptions) {
        var dynValue = dynamicOptions[param]
        return createDynamicDecl(dynValue, function (env, scope) {
          var result = env.invoke(scope, dynValue)
          if (isOffset) {
            env.OFFSET = result
            
          }
          return result
        })
      } else if (isOffset && elements) {
        return createStaticDecl(function (env, scope) {
          env.OFFSET = '0'
          return 0
        })
      }
      return null
    }

    var OFFSET = parseParam(S_OFFSET, true)

    function parseVertCount () {
      if (S_COUNT in staticOptions) {
        var count = staticOptions[S_COUNT] | 0
        
        return createStaticDecl(function () {
          return count
        })
      } else if (S_COUNT in dynamicOptions) {
        var dynCount = dynamicOptions[S_COUNT]
        return createDynamicDecl(dynCount, function (env, scope) {
          var result = env.invoke(scope, dynCount)
          
          return result
        })
      } else if (elements) {
        if (isStatic(elements)) {
          if (elements) {
            if (OFFSET) {
              return new Declaration(
                OFFSET.thisDep,
                OFFSET.contextDep,
                OFFSET.propDep,
                function (env, scope) {
                  var result = scope.def(
                    env.ELEMENTS, '.vertCount-', env.OFFSET)

                  

                  return result
                })
            } else {
              return createStaticDecl(function (env, scope) {
                return scope.def(env.ELEMENTS, '.vertCount')
              })
            }
          } else {
            var result = createStaticDecl(function () {
              return -1
            })
            
            return result
          }
        } else {
          var variable = new Declaration(
            elements.thisDep || OFFSET.thisDep,
            elements.contextDep || OFFSET.contextDep,
            elements.propDep || OFFSET.propDep,
            function (env, scope) {
              var elements = env.ELEMENTS
              if (env.OFFSET) {
                return scope.def(elements, '?', elements, '.vertCount-',
                  env.OFFSET, ':-1')
              }
              return scope.def(elements, '?', elements, '.vertCount:-1')
            })
          
          return variable
        }
      }
      return null
    }

    return {
      elements: elements,
      primitive: parsePrimitive(),
      count: parseVertCount(),
      instances: parseParam(S_INSTANCES, false),
      offset: OFFSET
    }
  }

  function parseGLState (options, env) {
    var staticOptions = options.static
    var dynamicOptions = options.dynamic

    var STATE = {}

    GL_STATE_NAMES.forEach(function (prop) {
      var param = propName(prop)

      function parseParam (parseStatic, parseDynamic) {
        if (prop in staticOptions) {
          var value = parseStatic(staticOptions[prop])
          STATE[param] = createStaticDecl(function () {
            return value
          })
        } else if (prop in dynamicOptions) {
          var dyn = dynamicOptions[prop]
          STATE[param] = createDynamicDecl(dyn, function (env, scope) {
            return parseDynamic(env, scope, env.invoke(scope, dyn))
          })
        }
      }

      switch (prop) {
        case S_CULL_ENABLE:
        case S_BLEND_ENABLE:
        case S_DITHER:
        case S_STENCIL_ENABLE:
        case S_DEPTH_ENABLE:
        case S_SCISSOR_ENABLE:
        case S_POLYGON_OFFSET_ENABLE:
        case S_SAMPLE_ALPHA:
        case S_SAMPLE_ENABLE:
        case S_DEPTH_MASK:
          return parseParam(
            function (value) {
              
              return value
            },
            function (env, scope, value) {
              
              return value
            })

        case S_DEPTH_FUNC:
          return parseParam(
            function (value) {
              
              return compareFuncs[value]
            },
            function (env, scope, value) {
              var COMPARE_FUNCS = env.constants.compareFuncs
              
              return scope.def(COMPARE_FUNCS, '[', value, ']')
            })

        case S_DEPTH_RANGE:
          return parseParam(
            function (value) {
              
              return value
            },
            function (env, scope, value) {
              

              var Z_NEAR = scope.def('+', value, '[0]')
              var Z_FAR = scope.def('+', value, '[1]')
              return [Z_NEAR, Z_FAR]
            })

        case S_BLEND_FUNC:
          return parseParam(
            function (value) {
              
              var srcRGB = ('srcRGB' in value ? value.srcRGB : value.src)
              var srcAlpha = ('srcAlpha' in value ? value.srcAlpha : value.src)
              var dstRGB = ('dstRGB' in value ? value.dstRGB : value.dst)
              var dstAlpha = ('dstAlpha' in value ? value.dstAlpha : value.dst)
              
              
              
              

              

              return [
                blendFuncs[srcRGB],
                blendFuncs[dstRGB],
                blendFuncs[srcAlpha],
                blendFuncs[dstAlpha]
              ]
            },
            function (env, scope, value) {
              var BLEND_FUNCS = env.constants.blendFuncs

              

              function read (prefix, suffix) {
                var func = scope.def(
                  '"', prefix, suffix, '" in ', value,
                  '?', value, '.', prefix, suffix,
                  ':', value, '.', prefix)

                

                return func
              }

              var srcRGB = read('src', 'RGB')
              var dstRGB = read('dst', 'RGB')

              

              var SRC_RGB = scope.def(BLEND_FUNCS, '[', srcRGB, ']')
              var SRC_ALPHA = scope.def(BLEND_FUNCS, '[', read('src', 'Alpha'), ']')
              var DST_RGB = scope.def(BLEND_FUNCS, '[', dstRGB, ']')
              var DST_ALPHA = scope.def(BLEND_FUNCS, '[', read('dst', 'Alpha'), ']')

              return [SRC_RGB, DST_RGB, SRC_ALPHA, DST_ALPHA]
            })

        case S_BLEND_EQUATION:
          return parseParam(
            function (value) {
              if (typeof value === 'string') {
                
                return [
                  blendEquations[value],
                  blendEquations[value]
                ]
              } else if (typeof value === 'object') {
                
                
                return [
                  blendEquations[value.rgb],
                  blendEquations[value.alpha]
                ]
              } else {
                
              }
            },
            function (env, scope, value) {
              var BLEND_EQUATIONS = env.constants.blendEquations

              var RGB = scope.def()
              var ALPHA = scope.def()

              var ifte = env.cond('typeof ', value, '==="string"')

              

              ifte.then(
                RGB, '=', ALPHA, '=', BLEND_EQUATIONS, '[', value, '];')
              ifte.else(
                RGB, '=', BLEND_EQUATIONS, '[', value, '.rgb];',
                ALPHA, '=', BLEND_EQUATIONS, '[', value, '.alpha];')

              scope(ifte)

              return [RGB, ALPHA]
            })

        case S_BLEND_COLOR:
          return parseParam(
            function (value) {
              
              return loop(4, function (i) {
                return +value[i]
              })
            },
            function (env, scope, value) {
              
              return loop(4, function (i) {
                return scope.def('+', value, '[', i, ']')
              })
            })

        case S_STENCIL_MASK:
          return parseParam(
            function (value) {
              
              return value | 0
            },
            function (env, scope, value) {
              
              return scope.def(value, '|0')
            })

        case S_STENCIL_FUNC:
          return parseParam(
            function (value) {
              
              var cmp = value.cmp || 'keep'
              var ref = value.ref || 0
              var mask = 'mask' in value ? value.mask : -1
              
              
              
              return [
                compareFuncs[cmp],
                ref,
                mask
              ]
            },
            function (env, scope, value) {
              var COMPARE_FUNCS = env.constants.compareFuncs
              
              var cmp = scope.def(
                '"cmp" in ', value,
                '?', COMPARE_FUNCS, '[', value, '.cmp]',
                ':', GL_KEEP)
              var ref = scope.def(value, '.ref|0')
              var mask = scope.def(
                '"mask" in ', value,
                '?', value, '.mask|0:-1')
              return [cmp, ref, mask]
            })

        case S_STENCIL_OPFRONT:
        case S_STENCIL_OPBACK:
          return parseParam(
            function (value) {
              
              var fail = value.fail || 'keep'
              var zfail = value.zfail || 'keep'
              var zpass = value.zpass || 'keep'
              
              
              
              return [
                prop === S_STENCIL_OPBACK ? GL_BACK : GL_FRONT,
                stencilOps[fail],
                stencilOps[zfail],
                stencilOps[zpass]
              ]
            },
            function (env, scope, value) {
              var STENCIL_OPS = env.constants.stencilOps

              

              function read (name) {
                

                return scope.def(
                  '"', name, '" in ', value,
                  '?', STENCIL_OPS, '[', value, '.', name, ']:',
                  GL_KEEP)
              }

              return [
                prop === S_STENCIL_OPBACK ? GL_BACK : GL_FRONT,
                read('fail'),
                read('zfail'),
                read('zpass')
              ]
            })

        case S_POLYGON_OFFSET_OFFSET:
          return parseParam(
            function (value) {
              
              var factor = value.factor | 0
              var units = value.units | 0
              
              
              return [factor, units]
            },
            function (env, scope, value) {
              

              var FACTOR = scope.def(value, '.factor|0')
              var UNITS = scope.def(value, '.units|0')

              return [FACTOR, UNITS]
            })

        case S_CULL_FACE:
          return parseParam(
            function (value) {
              var face = 0
              if (value === 'front') {
                face = GL_FRONT
              } else if (value === 'back') {
                face = GL_BACK
              }
              
              return face
            },
            function (env, scope, value) {
              
              return scope.def(value, '==="front"?', GL_FRONT, ':', GL_BACK)
            })

        case S_LINE_WIDTH:
          return parseParam(
            function (value) {
              
              return value
            },
            function (env, scope, value) {
              

              return value
            })

        case S_FRONT_FACE:
          return parseParam(
            function (value) {
              
              return orientationType[value]
            },
            function (env, scope, value) {
              
              return scope.def(value + '==="cw"?' + GL_CW + ':' + GL_CCW)
            })

        case S_COLOR_MASK:
          return parseParam(
            function (value) {
              
              return value.map(function (v) { return !!v })
            },
            function (env, scope, value) {
              
              return loop(4, function (i) {
                return '!!' + value + '[' + i + ']'
              })
            })

        case S_SAMPLE_COVERAGE:
          return parseParam(
            function (value) {
              
              var sampleValue = 'value' in value ? value.value : 1
              var sampleInvert = !!value.invert
              
              return [sampleValue, sampleInvert]
            },
            function (env, scope, value) {
              
              var VALUE = scope.def(
                '"value" in ', value, '?+', value, '.value:1')
              var INVERT = scope.def('!!', value, '.invert')
              return [VALUE, INVERT]
            })
      }
    })

    return STATE
  }

  function parseUniforms (uniforms, env) {
    var staticUniforms = uniforms.static
    var dynamicUniforms = uniforms.dynamic

    var UNIFORMS = {}

    Object.keys(staticUniforms).forEach(function (name) {
      var value = staticUniforms[name]
      var result
      if (typeof value === 'number' ||
          typeof value === 'boolean') {
        result = createStaticDecl(function () {
          return value
        })
      } else if (typeof value === 'function') {
        var reglType = value._reglType
        if (reglType === 'texture2d' ||
            reglType === 'textureCube') {
          result = createStaticDecl(function (env) {
            return env.link(value)
          })
        } else if (reglType === 'framebuffer' ||
                   reglType === 'framebufferCube') {
          
          result = createStaticDecl(function (env) {
            return env.link(value.color[0])
          })
        } else {
          
        }
      } else if (isArrayLike(value)) {
        result = createStaticDecl(function (env) {
          var ITEM = env.global.def('[',
            loop(value.length, function (i) {
              
              return value[i]
            }), ']')
          return ITEM
        })
      } else {
        
      }
      result.value = value
      UNIFORMS[name] = result
    })

    Object.keys(dynamicUniforms).forEach(function (key) {
      var dyn = dynamicUniforms[key]
      UNIFORMS[key] = createDynamicDecl(dyn, function (env, scope) {
        return env.invoke(scope, dyn)
      })
    })

    return UNIFORMS
  }

  function parseAttributes (attributes, env) {
    var staticAttributes = attributes.static
    var dynamicAttributes = attributes.dynamic

    var attributeDefs = {}

    Object.keys(staticAttributes).forEach(function (attribute) {
      var value = staticAttributes[attribute]
      var id = stringStore.id(attribute)

      var record = new AttributeRecord()
      if (isBufferArgs(value)) {
        record.state = ATTRIB_STATE_POINTER
        record.buffer = bufferState.getBuffer(
          bufferState.create(value, GL_ARRAY_BUFFER, false, true))
        record.type = record.buffer.dtype
      } else {
        var buffer = bufferState.getBuffer(value)
        if (buffer) {
          record.state = ATTRIB_STATE_POINTER
          record.buffer = buffer
          record.type = buffer.dtype
        } else {
          
          if (value.constant) {
            var constant = value.constant
            record.buffer = 'null'
            record.state = ATTRIB_STATE_CONSTANT
            if (typeof constant === 'number') {
              record.x = constant
            } else {
              
              CUTE_COMPONENTS.forEach(function (c, i) {
                if (i < constant.length) {
                  record[c] = constant[i]
                }
              })
            }
          } else {
            if (isBufferArgs(value.buffer)) {
              buffer = bufferState.getBuffer(
                bufferState.create(value.buffer, GL_ARRAY_BUFFER, false, true))
            } else {
              buffer = bufferState.getBuffer(value.buffer)
            }
            

            var offset = value.offset | 0
            

            var stride = value.stride | 0
            

            var size = value.size | 0
            

            var normalized = !!value.normalized

            var type = 0
            if ('type' in value) {
              
              type = glTypes[value.type]
            }

            var divisor = value.divisor | 0
            if ('divisor' in value) {
              
              
            }

            

            record.buffer = buffer
            record.state = ATTRIB_STATE_POINTER
            record.size = size
            record.normalized = normalized
            record.type = type || buffer.dtype
            record.offset = offset
            record.stride = stride
            record.divisor = divisor
          }
        }
      }

      attributeDefs[attribute] = createStaticDecl(function (env, scope) {
        var cache = env.attribCache
        if (id in cache) {
          return cache[id]
        }
        var result = {
          isStream: false
        }
        Object.keys(record).forEach(function (key) {
          result[key] = record[key]
        })
        if (record.buffer) {
          result.buffer = env.link(record.buffer)
        }
        cache[id] = result
        return result
      })
    })

    Object.keys(dynamicAttributes).forEach(function (attribute) {
      var dyn = dynamicAttributes[attribute]

      function appendAttributeCode (env, block) {
        var VALUE = env.invoke(block, dyn)

        var shared = env.shared

        var IS_BUFFER_ARGS = shared.isBufferArgs
        var BUFFER_STATE = shared.buffer

        // Perform validation on attribute
        

        // allocate names for result
        var result = {
          isStream: block.def(false)
        }
        var defaultRecord = new AttributeRecord()
        defaultRecord.state = ATTRIB_STATE_POINTER
        Object.keys(defaultRecord).forEach(function (key) {
          result[key] = block.def('' + defaultRecord[key])
        })

        var BUFFER = result.buffer
        var TYPE = result.type
        block(
          'if(', IS_BUFFER_ARGS, '(', VALUE, ')){',
          result.isStream, '=true;',
          BUFFER, '=', BUFFER_STATE, '.createStream(', GL_ARRAY_BUFFER, ',', VALUE, ');',
          TYPE, '=', BUFFER, '.dtype;',
          '}else{',
          BUFFER, '=', BUFFER_STATE, '.getBuffer(', VALUE, ');',
          'if(', BUFFER, '){',
          TYPE, '=', BUFFER, '.dtype;',
          '}else if("constant" in ', VALUE, '){',
          result.state, '=', ATTRIB_STATE_CONSTANT, ';',
          'if(typeof ' + VALUE + '.constant === "number"){',
          result[CUTE_COMPONENTS[0]], '=', VALUE, '.constant;',
          CUTE_COMPONENTS.slice(1).map(function (n) {
            return result[n]
          }).join('='), '=0;',
          '}else{',
          CUTE_COMPONENTS.map(function (name, i) {
            return (
              result[name] + '=' + VALUE + '.constant.length>=' + i +
              '?' + VALUE + '.constant[' + i + ']:0;'
            )
          }).join(''),
          '}}else{',
          'if(', IS_BUFFER_ARGS, '(', VALUE, '.buffer)){',
          BUFFER, '=', BUFFER_STATE, '.createStream(', GL_ARRAY_BUFFER, ',', VALUE, '.buffer);',
          '}else{',
          BUFFER, '=', BUFFER_STATE, '.getBuffer(', VALUE, '.buffer);',
          '}',
          TYPE, '="type" in ', VALUE, '?',
          shared.glTypes, '[', VALUE, '.type]:', BUFFER, '.dtype;',
          result.normalized, '=!!', VALUE, '.normalized;')
        function emitReadRecord (name) {
          block(result[name], '=', VALUE, '.', name, '|0;')
        }
        emitReadRecord('size')
        emitReadRecord('offset')
        emitReadRecord('stride')
        emitReadRecord('divisor')

        block('}}')

        block.exit(
          'if(', result.isStream, '){',
          BUFFER_STATE, '.destroyStream(', BUFFER, ');',
          '}')

        return result
      }

      attributeDefs[attribute] = createDynamicDecl(dyn, appendAttributeCode)
    })

    return attributeDefs
  }

  function parseContext (context) {
    var staticContext = context.static
    var dynamicContext = context.dynamic
    var result = {}

    Object.keys(staticContext).forEach(function (name) {
      var value = staticContext[name]
      result[name] = createStaticDecl(function (env, scope) {
        if (typeof value === 'number' || typeof value === 'boolean') {
          return '' + value
        } else {
          return env.link(value)
        }
      })
    })

    Object.keys(dynamicContext).forEach(function (name) {
      var dyn = dynamicContext[name]
      result[name] = createDynamicDecl(dyn, function (env, scope) {
        return env.invoke(scope, dyn)
      })
    })

    return result
  }

  function parseArguments (options, attributes, uniforms, context, env) {
    var staticOptions = options.static
    var dynamicOptions = options.dynamic

    

    var framebuffer = parseFramebuffer(options, env)
    var viewportAndScissor = parseViewportScissor(options, framebuffer, env)
    var draw = parseDraw(options, env)
    var state = parseGLState(options, env)
    var shader = parseProgram(options, env)

    function copyBox (name) {
      var defn = viewportAndScissor[name]
      if (defn) {
        state[name] = defn
      }
    }
    copyBox(S_VIEWPORT)
    copyBox(propName(S_SCISSOR_BOX))

    var dirty = Object.keys(state).length > 0

    var result = {
      framebuffer: framebuffer,
      draw: draw,
      shader: shader,
      state: state,
      dirty: dirty
    }

    result.profile = parseProfile(options, env)
    result.uniforms = parseUniforms(uniforms, env)
    result.attributes = parseAttributes(attributes, env)
    result.context = parseContext(context, env)
    return result
  }

  // ===================================================
  // ===================================================
  // COMMON UPDATE FUNCTIONS
  // ===================================================
  // ===================================================
  function emitContext (env, scope, context) {
    var shared = env.shared
    var CONTEXT = shared.context

    var contextEnter = env.scope()

    Object.keys(context).forEach(function (name) {
      scope.save(CONTEXT, '.' + name)
      var defn = context[name]
      contextEnter(CONTEXT, '.', name, '=', defn.append(env, scope), ';')
    })

    scope(contextEnter)
  }

  // ===================================================
  // ===================================================
  // COMMON DRAWING FUNCTIONS
  // ===================================================
  // ===================================================
  function emitPollFramebuffer (env, scope, framebuffer, skipCheck) {
    var shared = env.shared

    var GL = shared.gl
    var FRAMEBUFFER_STATE = shared.framebuffer
    var EXT_DRAW_BUFFERS
    if (extDrawBuffers) {
      EXT_DRAW_BUFFERS = scope.def(shared.extensions, '.webgl_draw_buffers')
    }

    var constants = env.constants

    var DRAW_BUFFERS = constants.drawBuffer
    var BACK_BUFFER = constants.backBuffer

    var NEXT
    if (framebuffer) {
      NEXT = framebuffer.append(env, scope)
    } else {
      NEXT = scope.def(FRAMEBUFFER_STATE, '.next')
    }

    if (!skipCheck) {
      scope('if(', NEXT, '!==', FRAMEBUFFER_STATE, '.cur){')
    }
    scope(
      'if(', NEXT, '){',
      GL, '.bindFramebuffer(', GL_FRAMEBUFFER, ',', NEXT, '.framebuffer);')
    if (extDrawBuffers) {
      scope(EXT_DRAW_BUFFERS, '.drawBuffersWEBGL(',
        DRAW_BUFFERS, '[', NEXT, '.colorAttachments.length]);')
    }
    scope('}else{',
      GL, '.bindFramebuffer(', GL_FRAMEBUFFER, ',null);')
    if (extDrawBuffers) {
      scope(EXT_DRAW_BUFFERS, '.drawBuffersWEBGL(', BACK_BUFFER, ');')
    }
    scope(
      '}',
      FRAMEBUFFER_STATE, '.cur=', NEXT, ';')
    if (!skipCheck) {
      scope('}')
    }
  }

  function emitPollState (env, scope, args) {
    var shared = env.shared

    var GL = shared.gl

    var CURRENT_VARS = env.current
    var NEXT_VARS = env.next
    var CURRENT_STATE = shared.current
    var NEXT_STATE = shared.next

    var block = env.cond(CURRENT_STATE, '.dirty')

    GL_STATE_NAMES.forEach(function (prop) {
      var param = propName(prop)
      if (param in args.state) {
        return
      }

      var NEXT, CURRENT
      if (param in NEXT_VARS) {
        NEXT = NEXT_VARS[param]
        CURRENT = CURRENT_VARS[param]
        var parts = loop(currentState[param].length, function (i) {
          return block.def(NEXT, '[', i, ']')
        })
        block(env.cond(parts.map(function (p, i) {
          return p + '!==' + CURRENT + '[' + i + ']'
        }).join('||'))
          .then(
            GL, '.', GL_VARIABLES[param], '(', parts, ');',
            parts.map(function (p, i) {
              return CURRENT + '[' + i + ']=' + p
            }).join(';'), ';'))
      } else {
        NEXT = block.def(NEXT_STATE, '.', param)
        var ifte = env.cond(NEXT, '!==', CURRENT_STATE, '.', param)
        block(ifte)
        if (param in GL_FLAGS) {
          ifte(
            env.cond(NEXT)
                .then(GL, '.enable(', GL_FLAGS[param], ');')
                .else(GL, '.disable(', GL_FLAGS[param], ');'),
            CURRENT_STATE, '.', param, '=', NEXT, ';')
        } else {
          ifte(
            GL, '.', GL_VARIABLES[param], '(', NEXT, ');',
            CURRENT_STATE, '.', param, '=', NEXT, ';')
        }
      }
    })
    if (Object.keys(args.state).length === 0) {
      block(CURRENT_STATE, '.dirty=false;')
    }
    scope(block)
  }

  function emitSetOptions (env, scope, options, filter) {
    var shared = env.shared
    var CURRENT_VARS = env.current
    var CURRENT_STATE = shared.current
    var GL = shared.gl
    sortState(Object.keys(options)).forEach(function (param) {
      var defn = options[param]
      if (filter && !filter(defn)) {
        return
      }
      var variable = defn.append(env, scope)
      if (GL_FLAGS[param]) {
        var flag = GL_FLAGS[param]
        if (isStatic(defn)) {
          if (variable) {
            scope(GL, '.enable(', flag, ');')
          } else {
            scope(GL, '.disable(', flag, ');')
          }
        } else {
          scope(env.cond(variable)
            .then(GL, '.enable(', flag, ');')
            .else(GL, '.disable(', flag, ');'))
        }
        scope(CURRENT_STATE, '.', param, '=', variable, ';')
      } else if (isArrayLike(variable)) {
        var CURRENT = CURRENT_VARS[param]
        scope(
          GL, '.', GL_VARIABLES[param], '(', variable, ');',
          variable.map(function (v, i) {
            return CURRENT + '[' + i + ']=' + v
          }).join(';'), ';')
      } else {
        scope(
          GL, '.', GL_VARIABLES[param], '(', variable, ');',
          CURRENT_STATE, '.', param, '=', variable, ';')
      }
    })
  }

  function injectExtensions (env, scope) {
    if (extInstancing && !env.instancing) {
      env.instancing = scope.def(
        env.shared.extensions, '.angle_instanced_arrays')
    }
  }

  function emitProfile (env, scope, args, useScope, incrementCounter) {
    var shared = env.shared
    var STATS = env.stats
    var CURRENT_STATE = shared.current
    var TIMER = shared.timer
    var profileArg = args.profile

    function perfCounter () {
      if (typeof performance === 'undefined') {
        return 'Date.now()'
      } else {
        return 'performance.now()'
      }
    }

    var CPU_START, QUERY_COUNTER
    function emitProfileStart (block) {
      CPU_START = scope.def()
      block(CPU_START, '=', perfCounter(), ';')
      if (typeof incrementCounter === 'string') {
        block(STATS, '.count+=', incrementCounter, ';')
      } else {
        block(STATS, '.count++;')
      }
      if (timer) {
        if (useScope) {
          QUERY_COUNTER = scope.def()
          block(QUERY_COUNTER, '=', TIMER, '.getNumPendingQueries();')
        } else {
          block(TIMER, '.beginQuery(', STATS, ');')
        }
      }
    }

    function emitProfileEnd (block) {
      block(STATS, '.cpuTime+=', perfCounter(), '-', CPU_START, ';')
      if (timer) {
        if (useScope) {
          block(TIMER, '.pushScopeStats(',
            QUERY_COUNTER, ',',
            TIMER, '.getNumPendingQueries(),',
            STATS, ');')
        } else {
          block(TIMER, '.endQuery();')
        }
      }
    }

    function scopeProfile (value) {
      var prev = scope.def(CURRENT_STATE, '.profile')
      scope(CURRENT_STATE, '.profile=', value, ';')
      scope.exit(CURRENT_STATE, '.profile=', prev, ';')
    }

    var USE_PROFILE
    if (profileArg) {
      if (isStatic(profileArg)) {
        if (profileArg.enable) {
          emitProfileStart(scope)
          emitProfileEnd(scope.exit)
          scopeProfile('true')
        } else {
          scopeProfile('false')
        }
        return
      }
      USE_PROFILE = profileArg.append(env, scope)
      scopeProfile(USE_PROFILE)
    } else {
      USE_PROFILE = scope.def(CURRENT_STATE, '.profile')
    }

    var start = env.block()
    emitProfileStart(start)
    scope('if(', USE_PROFILE, '){', start, '}')
    var end = env.block()
    emitProfileEnd(end)
    scope.exit('if(', USE_PROFILE, '){', end, '}')
  }

  function emitAttributes (env, scope, args, attributes, filter) {
    var shared = env.shared

    function typeLength (x) {
      switch (x) {
        case GL_FLOAT_VEC2:
        case GL_INT_VEC2:
        case GL_BOOL_VEC2:
          return 2
        case GL_FLOAT_VEC3:
        case GL_INT_VEC3:
        case GL_BOOL_VEC3:
          return 3
        case GL_FLOAT_VEC4:
        case GL_INT_VEC4:
        case GL_BOOL_VEC4:
          return 4
        default:
          return 1
      }
    }

    function emitBindAttribute (ATTRIBUTE, size, record) {
      var GL = shared.gl

      var LOCATION = scope.def(ATTRIBUTE, '.location')
      var BINDING = scope.def(shared.attributes, '[', LOCATION, ']')

      var STATE = record.state
      var BUFFER = record.buffer
      var CONST_COMPONENTS = [
        record.x,
        record.y,
        record.z,
        record.w
      ]

      var COMMON_KEYS = [
        'buffer',
        'normalized',
        'offset',
        'stride'
      ]

      function emitBuffer () {
        scope(
          'if(!', BINDING, '.buffer){',
          GL, '.enableVertexAttribArray(', LOCATION, ');}')

        var TYPE = record.type
        var SIZE
        if (!record.size) {
          SIZE = size
        } else {
          SIZE = scope.def(record.size, '||', size)
        }

        scope('if(',
          BINDING, '.type!==', TYPE, '||',
          BINDING, '.size!==', SIZE, '||',
          COMMON_KEYS.map(function (key) {
            return BINDING + '.' + key + '!==' + record[key]
          }).join('||'),
          '){',
          GL, '.bindBuffer(', GL_ARRAY_BUFFER, ',', BUFFER, '.buffer);',
          GL, '.vertexAttribPointer(', [
            LOCATION,
            SIZE,
            TYPE,
            record.normalized,
            record.stride,
            record.offset
          ], ');',
          BINDING, '.type=', TYPE, ';',
          BINDING, '.size=', SIZE, ';',
          COMMON_KEYS.map(function (key) {
            return BINDING + '.' + key + '=' + record[key] + ';'
          }).join(''),
          '}')

        if (extInstancing) {
          var DIVISOR = record.divisor
          scope(
            'if(', BINDING, '.divisor!==', DIVISOR, '){',
            env.instancing, '.vertexAttribDivisorANGLE(', [LOCATION, DIVISOR], ');',
            BINDING, '.divisor=', DIVISOR, ';}')
        }
      }

      function emitConstant () {
        scope(
          'if(', BINDING, '.buffer){',
          GL, '.disableVertexAttribArray(', LOCATION, ');',
          '}if(', CUTE_COMPONENTS.map(function (c, i) {
            return BINDING + '.' + c + '!==' + CONST_COMPONENTS[i]
          }).join('||'), '){',
          GL, '.vertexAttrib4f(', LOCATION, ',', CONST_COMPONENTS, ');',
          CUTE_COMPONENTS.map(function (c, i) {
            return BINDING + '.' + c + '=' + CONST_COMPONENTS[i] + ';'
          }).join(''),
          '}')
      }

      if (STATE === ATTRIB_STATE_POINTER) {
        emitBuffer()
      } else if (STATE === ATTRIB_STATE_CONSTANT) {
        emitConstant()
      } else {
        scope('if(', STATE, '===', ATTRIB_STATE_POINTER, '){')
        emitBuffer()
        scope('}else{')
        emitConstant()
        scope('}')
      }
    }

    attributes.forEach(function (attribute) {
      var name = attribute.name
      var arg = args.attributes[name]
      var record
      if (arg) {
        if (!filter(arg)) {
          return
        }
        record = arg.append(env, scope)
      } else {
        if (!filter(SCOPE_DECL)) {
          return
        }
        var scopeAttrib = env.scopeAttrib(name)
        
        record = {}
        Object.keys(new AttributeRecord()).forEach(function (key) {
          record[key] = scope.def(scopeAttrib, '.', key)
        })
      }
      emitBindAttribute(
        env.link(attribute), typeLength(attribute.info.type), record)
    })
  }

  function emitUniforms (env, scope, args, uniforms, filter) {
    var shared = env.shared
    var GL = shared.gl

    var infix
    for (var i = 0; i < uniforms.length; ++i) {
      var uniform = uniforms[i]
      var name = uniform.name
      var type = uniform.info.type
      var arg = args.uniforms[name]
      var UNIFORM = env.link(uniform)
      var LOCATION = UNIFORM + '.location'

      var VALUE
      if (arg) {
        if (!filter(arg)) {
          continue
        }
        if (isStatic(arg)) {
          var value = arg.value
          
          if (type === GL_SAMPLER_2D || type === GL_SAMPLER_CUBE) {
            
            var TEX_VALUE = env.link(value._texture || value.color[0]._texture)
            scope(GL, '.uniform1i(', LOCATION, ',', TEX_VALUE + '.bind());')
            scope.exit(TEX_VALUE, '.unbind();')
          } else if (
            type === GL_FLOAT_MAT2 ||
            type === GL_FLOAT_MAT3 ||
            type === GL_FLOAT_MAT4) {
            
            var MAT_VALUE = env.global.def('new Float32Array([' +
              Array.prototype.slice.call(value) + '])')
            var dim = 2
            if (type === GL_FLOAT_MAT3) {
              dim = 3
            } else if (type === GL_FLOAT_MAT4) {
              dim = 4
            }
            scope(
              GL, '.uniformMatrix', dim, 'fv(',
              LOCATION, ',false,', MAT_VALUE, ');')
          } else {
            switch (type) {
              case GL_FLOAT:
                
                infix = '1f'
                break
              case GL_FLOAT_VEC2:
                
                infix = '2f'
                break
              case GL_FLOAT_VEC3:
                
                infix = '3f'
                break
              case GL_FLOAT_VEC4:
                
                infix = '4f'
                break
              case GL_BOOL:
                
                infix = '1i'
                break
              case GL_INT:
                
                infix = '1i'
                break
              case GL_BOOL_VEC2:
                
                infix = '2i'
                break
              case GL_INT_VEC2:
                
                infix = '2i'
                break
              case GL_BOOL_VEC3:
                
                infix = '3i'
                break
              case GL_INT_VEC3:
                
                infix = '3i'
                break
              case GL_BOOL_VEC4:
                
                infix = '4i'
                break
              case GL_INT_VEC4:
                
                infix = '4i'
                break
            }
            scope(GL, '.uniform', infix, '(', LOCATION, ',',
              isArrayLike(value) ? Array.prototype.slice.call(value) : value,
              ');')
          }
          continue
        } else {
          VALUE = arg.append(env, scope)
        }
      } else {
        if (!filter(SCOPE_DECL)) {
          continue
        }
        VALUE = scope.def(shared.uniforms, '[', stringStore.id(name), ']')
      }

      if (type === GL_SAMPLER_2D) {
        scope(
          'if(', VALUE, '&&', VALUE, '._reglType==="framebuffer"){',
          VALUE, '=', VALUE, '.color[0];',
          '}')
      } else if (type === GL_SAMPLER_CUBE) {
        scope(
          'if(', VALUE, '&&', VALUE, '._reglType==="framebufferCube"){',
          VALUE, '=', VALUE, '.color[0];',
          '}')
      }

      // perform type validation
      

      var unroll = 1
      switch (type) {
        case GL_SAMPLER_2D:
        case GL_SAMPLER_CUBE:
          var TEX = scope.def(VALUE, '._texture')
          scope(GL, '.uniform1i(', LOCATION, ',', TEX, '.bind());')
          scope.exit(TEX, '.unbind();')
          continue

        case GL_INT:
        case GL_BOOL:
          infix = '1i'
          break

        case GL_INT_VEC2:
        case GL_BOOL_VEC2:
          infix = '2i'
          unroll = 2
          break

        case GL_INT_VEC3:
        case GL_BOOL_VEC3:
          infix = '3i'
          unroll = 3
          break

        case GL_INT_VEC4:
        case GL_BOOL_VEC4:
          infix = '4i'
          unroll = 4
          break

        case GL_FLOAT:
          infix = '1f'
          break

        case GL_FLOAT_VEC2:
          infix = '2f'
          unroll = 2
          break

        case GL_FLOAT_VEC3:
          infix = '3f'
          unroll = 3
          break

        case GL_FLOAT_VEC4:
          infix = '4f'
          unroll = 4
          break

        case GL_FLOAT_MAT2:
          infix = 'Matrix2fv'
          break

        case GL_FLOAT_MAT3:
          infix = 'Matrix3fv'
          break

        case GL_FLOAT_MAT4:
          infix = 'Matrix4fv'
          break
      }

      scope(GL, '.uniform', infix, '(', LOCATION, ',')
      if (infix.charAt(0) === 'M') {
        var matSize = Math.pow(type - GL_FLOAT_MAT2 + 2, 2)
        var STORAGE = env.global.def('new Float32Array(', matSize, ')')
        scope(
          'false,(Array.isArray(', VALUE, ')||', VALUE, ' instanceof Float32Array)?', VALUE, ':(',
          loop(matSize, function (i) {
            return STORAGE + '[' + i + ']=' + VALUE + '[' + i + ']'
          }), ',', STORAGE, ')')
      } else if (unroll > 1) {
        scope(loop(unroll, function (i) {
          return VALUE + '[' + i + ']'
        }))
      } else {
        scope(VALUE)
      }
      scope(');')
    }
  }

  function emitDraw (env, outer, inner, args) {
    var shared = env.shared
    var GL = shared.gl
    var DRAW_STATE = shared.draw

    var drawOptions = args.draw

    function emitElements () {
      var defn = drawOptions.elements
      var ELEMENTS
      var scope = outer
      if (defn) {
        if ((defn.contextDep && args.contextDynamic) || defn.propDep) {
          scope = inner
        }
        ELEMENTS = defn.append(env, scope)
      } else {
        ELEMENTS = scope.def(DRAW_STATE, '.', S_ELEMENTS)
      }
      if (ELEMENTS) {
        scope(
          'if(' + ELEMENTS + ')' +
          GL + '.bindBuffer(' + GL_ELEMENT_ARRAY_BUFFER + ',' + ELEMENTS + '.buffer.buffer);')
      }
      return ELEMENTS
    }

    function emitCount () {
      var defn = drawOptions.count
      var COUNT
      var scope = outer
      if (defn) {
        if ((defn.contextDep && args.contextDynamic) || defn.propDep) {
          scope = inner
        }
        COUNT = defn.append(env, scope)
        
      } else {
        COUNT = scope.def(DRAW_STATE, '.', S_COUNT)
        
      }
      return COUNT
    }

    var ELEMENTS = emitElements()
    function emitValue (name) {
      var defn = drawOptions[name]
      if (defn) {
        if ((defn.contextDep && args.contextDynamic) || defn.propDep) {
          return defn.append(env, inner)
        } else {
          return defn.append(env, outer)
        }
      } else {
        return outer.def(DRAW_STATE, '.', name)
      }
    }

    var PRIMITIVE = emitValue(S_PRIMITIVE)
    var OFFSET = emitValue(S_OFFSET)

    var COUNT = emitCount()
    if (typeof COUNT === 'number') {
      if (COUNT === 0) {
        return
      }
    } else {
      inner('if(', COUNT, '){')
      inner.exit('}')
    }

    var INSTANCES, EXT_INSTANCING
    if (extInstancing) {
      INSTANCES = emitValue(S_INSTANCES)
      EXT_INSTANCING = env.instancing
    }

    var ELEMENT_TYPE = ELEMENTS + '.type'

    var elementsStatic = drawOptions.elements && isStatic(drawOptions.elements)

    function emitInstancing () {
      function drawElements () {
        inner(EXT_INSTANCING, '.drawElementsInstancedANGLE(', [
          PRIMITIVE,
          COUNT,
          ELEMENT_TYPE,
          OFFSET + '<<((' + ELEMENT_TYPE + '-' + GL_UNSIGNED_BYTE + ')>>1)',
          INSTANCES
        ], ');')
      }

      function drawArrays () {
        inner(EXT_INSTANCING, '.drawArraysInstancedANGLE(',
          [PRIMITIVE, OFFSET, COUNT, INSTANCES], ');')
      }

      if (ELEMENTS) {
        if (!elementsStatic) {
          inner('if(', ELEMENTS, '){')
          drawElements()
          inner('}else{')
          drawArrays()
          inner('}')
        } else {
          drawElements()
        }
      } else {
        drawArrays()
      }
    }

    function emitRegular () {
      function drawElements () {
        inner(GL + '.drawElements(' + [
          PRIMITIVE,
          COUNT,
          ELEMENT_TYPE,
          OFFSET + '<<((' + ELEMENT_TYPE + '-' + GL_UNSIGNED_BYTE + ')>>1)'
        ] + ');')
      }

      function drawArrays () {
        inner(GL + '.drawArrays(' + [PRIMITIVE, OFFSET, COUNT] + ');')
      }

      if (ELEMENTS) {
        if (!elementsStatic) {
          inner('if(', ELEMENTS, '){')
          drawElements()
          inner('}else{')
          drawArrays()
          inner('}')
        } else {
          drawElements()
        }
      } else {
        drawArrays()
      }
    }

    if (extInstancing && (typeof INSTANCES !== 'number' || INSTANCES >= 0)) {
      if (typeof INSTANCES === 'string') {
        inner('if(', INSTANCES, '>0){')
        emitInstancing()
        inner('}else if(', INSTANCES, '<0){')
        emitRegular()
        inner('}')
      } else {
        emitInstancing()
      }
    } else {
      emitRegular()
    }
  }

  function createBody (emitBody, parentEnv, args, program, count) {
    var env = createREGLEnvironment()
    var scope = env.proc('body', count)
    
    if (extInstancing) {
      env.instancing = scope.def(
        env.shared.extensions, '.angle_instanced_arrays')
    }
    emitBody(env, scope, args, program)
    return env.compile().body
  }

  // ===================================================
  // ===================================================
  // DRAW PROC
  // ===================================================
  // ===================================================
  function emitDrawBody (env, draw, args, program) {
    injectExtensions(env, draw)
    emitAttributes(env, draw, args, program.attributes, function () {
      return true
    })
    emitUniforms(env, draw, args, program.uniforms, function () {
      return true
    })
    emitDraw(env, draw, draw, args)
  }

  function emitDrawProc (env, args) {
    var draw = env.proc('draw', 1)

    injectExtensions(env, draw)

    emitContext(env, draw, args.context)
    emitPollFramebuffer(env, draw, args.framebuffer)

    emitPollState(env, draw, args)
    emitSetOptions(env, draw, args.state)

    emitProfile(env, draw, args, false, true)

    var program = args.shader.progVar.append(env, draw)
    draw(env.shared.gl, '.useProgram(', program, '.program);')

    if (args.shader.program) {
      emitDrawBody(env, draw, args, args.shader.program)
    } else {
      var drawCache = env.global.def('{}')
      var PROG_ID = draw.def(program, '.id')
      var CACHED_PROC = draw.def(drawCache, '[', PROG_ID, ']')
      draw(
        env.cond(CACHED_PROC)
          .then(CACHED_PROC, '.call(this,a0);')
          .else(
            CACHED_PROC, '=', drawCache, '[', PROG_ID, ']=',
            env.link(function (program) {
              return createBody(emitDrawBody, env, args, program, 1)
            }), '(', program, ');',
            CACHED_PROC, '.call(this,a0);'))
    }

    if (Object.keys(args.state).length > 0) {
      draw(env.shared.current, '.dirty=true;')
    }
  }

  // ===================================================
  // ===================================================
  // BATCH PROC
  // ===================================================
  // ===================================================

  function emitBatchDynamicShaderBody (env, scope, args, program) {
    env.batchId = 'a1'

    injectExtensions(env, scope)

    function all () {
      return true
    }

    emitAttributes(env, scope, args, program.attributes, all)
    emitUniforms(env, scope, args, program.uniforms, all)
    emitDraw(env, scope, scope, args)
  }

  function emitBatchBody (env, scope, args, program) {
    injectExtensions(env, scope)

    var contextDynamic = args.contextDep

    var BATCH_ID = scope.def()
    var PROP_LIST = 'a0'
    var NUM_PROPS = 'a1'
    var PROPS = scope.def()
    env.shared.props = PROPS
    env.batchId = BATCH_ID

    var outer = env.scope()
    var inner = env.scope()

    scope(
      outer.entry,
      'for(', BATCH_ID, '=0;', BATCH_ID, '<', NUM_PROPS, ';++', BATCH_ID, '){',
      PROPS, '=', PROP_LIST, '[', BATCH_ID, '];',
      inner,
      '}',
      outer.exit)

    function isInnerDefn (defn) {
      return ((defn.contextDep && contextDynamic) || defn.propDep)
    }

    function isOuterDefn (defn) {
      return !isInnerDefn(defn)
    }

    if (args.needsContext) {
      emitContext(env, inner, args.context)
    }
    if (args.needsFramebuffer) {
      emitPollFramebuffer(env, inner, args.framebuffer)
    }
    emitSetOptions(env, inner, args.state, isInnerDefn)

    if (args.profile && isInnerDefn(args.profile)) {
      emitProfile(env, inner, args, false, true)
    }

    if (!program) {
      var progCache = env.global.def('{}')
      var PROGRAM = args.shader.progVar.append(env, inner)
      var PROG_ID = inner.def(PROGRAM, '.id')
      var CACHED_PROC = inner.def(progCache, '[', PROG_ID, ']')
      inner(
        env.shared.gl, '.useProgram(', PROGRAM, '.program);',
        'if(!', CACHED_PROC, '){',
        CACHED_PROC, '=', progCache, '[', PROG_ID, ']=',
        env.link(function (program) {
          return createBody(
            emitBatchDynamicShaderBody, env, args, program, 2)
        }), '(', PROGRAM, ');}',
        CACHED_PROC, '.call(this,a0[', BATCH_ID, '],', BATCH_ID, ');')
    } else {
      emitAttributes(env, outer, args, program.attributes, isOuterDefn)
      emitAttributes(env, inner, args, program.attributes, isInnerDefn)
      emitUniforms(env, outer, args, program.uniforms, isOuterDefn)
      emitUniforms(env, inner, args, program.uniforms, isInnerDefn)
      emitDraw(env, outer, inner, args)
    }
  }

  function emitBatchProc (env, args) {
    var batch = env.proc('batch', 2)
    env.batchId = '0'

    injectExtensions(env, batch)

    // Check if any context variables depend on props
    var contextDynamic = false
    var needsContext = true
    Object.keys(args.context).forEach(function (name) {
      contextDynamic = contextDynamic || args.context[name].propDep
    })
    if (!contextDynamic) {
      emitContext(env, batch, args.context)
      needsContext = false
    }

    // framebuffer state affects framebufferWidth/height context vars
    var framebuffer = args.framebuffer
    var needsFramebuffer = false
    if (framebuffer) {
      if (framebuffer.propDep) {
        contextDynamic = needsFramebuffer = true
      } else if (framebuffer.contextDep && contextDynamic) {
        needsFramebuffer = true
      }
      if (!needsFramebuffer) {
        emitPollFramebuffer(env, batch, framebuffer)
      }
    } else {
      emitPollFramebuffer(env, batch, null)
    }

    // viewport is weird because it can affect context vars
    if (args.state.viewport && args.state.viewport.propDep) {
      contextDynamic = true
    }

    function isInnerDefn (defn) {
      return (defn.contextDep && contextDynamic) || defn.propDep
    }

    // set webgl options
    emitPollState(env, batch, args)
    emitSetOptions(env, batch, args.state, function (defn) {
      return !isInnerDefn(defn)
    })

    if (!args.profile || !isInnerDefn(args.profile)) {
      emitProfile(env, batch, args, false, 'a1')
    }

    // Save these values to args so that the batch body routine can use them
    args.contextDep = contextDynamic
    args.needsContext = needsContext
    args.needsFramebuffer = needsFramebuffer

    // determine if shader is dynamic
    var progDefn = args.shader.progVar
    if ((progDefn.contextDep && contextDynamic) || progDefn.propDep) {
      emitBatchBody(
        env,
        batch,
        args,
        null)
    } else {
      var PROGRAM = progDefn.append(env, batch)
      batch(env.shared.gl, '.useProgram(', PROGRAM, '.program);')
      if (args.shader.program) {
        emitBatchBody(
          env,
          batch,
          args,
          args.shader.program)
      } else {
        var batchCache = env.global.def('{}')
        var PROG_ID = batch.def(PROGRAM, '.id')
        var CACHED_PROC = batch.def(batchCache, '[', PROG_ID, ']')
        batch(
          env.cond(CACHED_PROC)
            .then(CACHED_PROC, '.call(this,a0,a1);')
            .else(
              CACHED_PROC, '=', batchCache, '[', PROG_ID, ']=',
              env.link(function (program) {
                return createBody(emitBatchBody, env, args, program, 2)
              }), '(', PROGRAM, ');',
              CACHED_PROC, '.call(this,a0,a1);'))
      }
    }

    if (Object.keys(args.state).length > 0) {
      batch(env.shared.current, '.dirty=true;')
    }
  }

  // ===================================================
  // ===================================================
  // SCOPE COMMAND
  // ===================================================
  // ===================================================
  function emitScopeProc (env, args) {
    var scope = env.proc('scope', 3)
    env.batchId = 'a2'

    var shared = env.shared
    var CURRENT_STATE = shared.current

    emitContext(env, scope, args.context)

    if (args.framebuffer) {
      args.framebuffer.append(env, scope)
    }

    sortState(Object.keys(args.state)).forEach(function (name) {
      var defn = args.state[name]
      var value = defn.append(env, scope)
      if (isArrayLike(value)) {
        value.forEach(function (v, i) {
          scope.set(env.next[name], '[' + i + ']', v)
        })
      } else {
        scope.set(shared.next, '.' + name, value)
      }
    })

    emitProfile(env, scope, args, true, true)

    ;[S_ELEMENTS, S_OFFSET, S_COUNT, S_INSTANCES, S_PRIMITIVE].forEach(
      function (opt) {
        var variable = args.draw[opt]
        if (!variable) {
          return
        }
        scope.set(shared.draw, '.' + opt, '' + variable.append(env, scope))
      })

    Object.keys(args.uniforms).forEach(function (opt) {
      scope.set(
        shared.uniforms,
        '[' + stringStore.id(opt) + ']',
        args.uniforms[opt].append(env, scope))
    })

    Object.keys(args.attributes).forEach(function (name) {
      var record = args.attributes[name].append(env, scope)
      var scopeAttrib = env.scopeAttrib(name)
      Object.keys(new AttributeRecord()).forEach(function (prop) {
        scope.set(scopeAttrib, '.' + prop, record[prop])
      })
    })

    function saveShader (name) {
      var shader = args.shader[name]
      if (shader) {
        scope.set(shared.shader, '.' + name, shader.append(env, scope))
      }
    }
    saveShader(S_VERT)
    saveShader(S_FRAG)

    if (Object.keys(args.state).length > 0) {
      scope(CURRENT_STATE, '.dirty=true;')
      scope.exit(CURRENT_STATE, '.dirty=true;')
    }

    scope('a1(', env.shared.context, ',a0,', env.batchId, ');')
  }

  function isDynamicObject (object) {
    if (typeof object !== 'object' || isArrayLike(object)) {
      return
    }
    var props = Object.keys(object)
    for (var i = 0; i < props.length; ++i) {
      if (dynamic.isDynamic(object[props[i]])) {
        return true
      }
    }
    return false
  }

  function splatObject (env, options, name) {
    var object = options.static[name]
    if (!object || !isDynamicObject(object)) {
      return
    }

    var globals = env.global
    var keys = Object.keys(object)
    var thisDep = false
    var contextDep = false
    var propDep = false
    var objectRef = env.global.def('{}')
    keys.forEach(function (key) {
      var value = object[key]
      if (dynamic.isDynamic(value)) {
        if (typeof value === 'function') {
          value = object[key] = dynamic.unbox(value)
        }
        var deps = createDynamicDecl(value, null)
        thisDep = thisDep || deps.thisDep
        propDep = propDep || deps.propDep
        contextDep = contextDep || deps.contextDep
      } else {
        globals(objectRef, '.', key, '=')
        switch (typeof value) {
          case 'number':
            globals(value)
            break
          case 'string':
            globals('"', value, '"')
            break
          case 'object':
            if (Array.isArray(value)) {
              globals('[', value.join(), ']')
            }
            break
          default:
            globals(env.link(value))
            break
        }
        globals(';')
      }
    })

    function appendBlock (env, block) {
      keys.forEach(function (key) {
        var value = object[key]
        if (!dynamic.isDynamic(value)) {
          return
        }
        var ref = env.invoke(block, value)
        block(objectRef, '.', key, '=', ref, ';')
      })
    }

    options.dynamic[name] = new dynamic.DynamicVariable(DYN_THUNK, {
      thisDep: thisDep,
      contextDep: contextDep,
      propDep: propDep,
      ref: objectRef,
      append: appendBlock
    })
    delete options.static[name]
  }

  // ===========================================================================
  // ===========================================================================
  // MAIN DRAW COMMAND
  // ===========================================================================
  // ===========================================================================
  function compileCommand (options, attributes, uniforms, context, stats) {
    var env = createREGLEnvironment()

    // link stats, so that we can easily access it in the program.
    env.stats = env.link(stats)

    // splat options and attributes to allow for dynamic nested properties
    Object.keys(attributes.static).forEach(function (key) {
      splatObject(env, attributes, key)
    })
    NESTED_OPTIONS.forEach(function (name) {
      splatObject(env, options, name)
    })

    var args = parseArguments(options, attributes, uniforms, context, env)

    emitDrawProc(env, args)
    emitScopeProc(env, args)
    emitBatchProc(env, args)

    return env.compile()
  }

  // ===========================================================================
  // ===========================================================================
  // POLL / REFRESH
  // ===========================================================================
  // ===========================================================================
  return {
    next: nextState,
    current: currentState,
    procs: (function () {
      var env = createREGLEnvironment()
      var poll = env.proc('poll')
      var refresh = env.proc('refresh')
      var common = env.block()
      poll(common)
      refresh(common)

      var shared = env.shared
      var GL = shared.gl
      var NEXT_STATE = shared.next
      var CURRENT_STATE = shared.current

      common(CURRENT_STATE, '.dirty=false;')

      emitPollFramebuffer(env, poll)
      emitPollFramebuffer(env, refresh, null, true)

      // Refresh updates all attribute state changes
      var extInstancing = gl.getExtension('angle_instanced_arrays')
      var INSTANCING
      if (extInstancing) {
        INSTANCING = env.link(extInstancing)
      }
      for (var i = 0; i < limits.maxAttributes; ++i) {
        var BINDING = refresh.def(shared.attributes, '[', i, ']')
        var ifte = env.cond(BINDING, '.buffer')
        ifte.then(
          GL, '.enableVertexAttribArray(', i, ');',
          GL, '.bindBuffer(',
            GL_ARRAY_BUFFER, ',',
            BINDING, '.buffer.buffer);',
          GL, '.vertexAttribPointer(',
            i, ',',
            BINDING, '.size,',
            BINDING, '.type,',
            BINDING, '.normalized,',
            BINDING, '.stride,',
            BINDING, '.offset);'
        ).else(
          GL, '.disableVertexAttribArray(', i, ');',
          GL, '.vertexAttrib4f(',
            i, ',',
            BINDING, '.x,',
            BINDING, '.y,',
            BINDING, '.z,',
            BINDING, '.w);',
          BINDING, '.buffer=null;')
        refresh(ifte)
        if (extInstancing) {
          refresh(
            INSTANCING, '.vertexAttribDivisorANGLE(',
            i, ',',
            BINDING, '.divisor);')
        }
      }

      Object.keys(GL_FLAGS).forEach(function (flag) {
        var cap = GL_FLAGS[flag]
        var NEXT = common.def(NEXT_STATE, '.', flag)
        var block = env.block()
        block('if(', NEXT, '){',
          GL, '.enable(', cap, ')}else{',
          GL, '.disable(', cap, ')}',
          CURRENT_STATE, '.', flag, '=', NEXT, ';')
        refresh(block)
        poll(
          'if(', NEXT, '!==', CURRENT_STATE, '.', flag, '){',
          block,
          '}')
      })

      Object.keys(GL_VARIABLES).forEach(function (name) {
        var func = GL_VARIABLES[name]
        var init = currentState[name]
        var NEXT, CURRENT
        var block = env.block()
        block(GL, '.', func, '(')
        if (isArrayLike(init)) {
          var n = init.length
          NEXT = env.global.def(NEXT_STATE, '.', name)
          CURRENT = env.global.def(CURRENT_STATE, '.', name)
          block(
            loop(n, function (i) {
              return NEXT + '[' + i + ']'
            }), ');',
            loop(n, function (i) {
              return CURRENT + '[' + i + ']=' + NEXT + '[' + i + '];'
            }).join(''))
          poll(
            'if(', loop(n, function (i) {
              return NEXT + '[' + i + ']!==' + CURRENT + '[' + i + ']'
            }).join('||'), '){',
            block,
            '}')
        } else {
          NEXT = common.def(NEXT_STATE, '.', name)
          CURRENT = common.def(CURRENT_STATE, '.', name)
          block(
            NEXT, ');',
            CURRENT_STATE, '.', name, '=', NEXT, ';')
          poll(
            'if(', NEXT, '!==', CURRENT, '){',
            block,
            '}')
        }
        refresh(block)
      })

      return env.compile()
    })(),
    compile: compileCommand
  }
}

},{"./constants/dtypes.json":5,"./constants/primitives.json":6,"./dynamic":9,"./util/codegen":22,"./util/is-array-like":24,"./util/is-ndarray":25,"./util/is-typed-array":26,"./util/loop":27}],9:[function(require,module,exports){
var VARIABLE_COUNTER = 0

var DYN_FUNC = 0

function DynamicVariable (type, data) {
  this.id = (VARIABLE_COUNTER++)
  this.type = type
  this.data = data
}

function escapeStr (str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function splitParts (str) {
  if (str.length === 0) {
    return []
  }

  var firstChar = str.charAt(0)
  var lastChar = str.charAt(str.length - 1)

  if (str.length > 1 &&
      firstChar === lastChar &&
      (firstChar === '"' || firstChar === "'")) {
    return ['"' + escapeStr(str.substr(1, str.length - 2)) + '"']
  }

  var parts = /\[(false|true|null|\d+|'[^']*'|"[^"]*")\]/.exec(str)
  if (parts) {
    return (
      splitParts(str.substr(0, parts.index))
      .concat(splitParts(parts[1]))
      .concat(splitParts(str.substr(parts.index + parts[0].length)))
    )
  }

  var subparts = str.split('.')
  if (subparts.length === 1) {
    return ['"' + escapeStr(str) + '"']
  }

  var result = []
  for (var i = 0; i < subparts.length; ++i) {
    result = result.concat(splitParts(subparts[i]))
  }
  return result
}

function toAccessorString (str) {
  return '[' + splitParts(str).join('][') + ']'
}

function defineDynamic (type, data) {
  return new DynamicVariable(type, toAccessorString(data + ''))
}

function isDynamic (x) {
  return (typeof x === 'function' && !x._reglType) ||
         x instanceof DynamicVariable
}

function unbox (x, path) {
  if (typeof x === 'function') {
    return new DynamicVariable(DYN_FUNC, x)
  }
  return x
}

module.exports = {
  DynamicVariable: DynamicVariable,
  define: defineDynamic,
  isDynamic: isDynamic,
  unbox: unbox,
  accessor: toAccessorString
}

},{}],10:[function(require,module,exports){

var isTypedArray = require('./util/is-typed-array')
var isNDArrayLike = require('./util/is-ndarray')
var values = require('./util/values')

var primTypes = require('./constants/primitives.json')
var usageTypes = require('./constants/usage.json')

var GL_POINTS = 0
var GL_LINES = 1
var GL_TRIANGLES = 4

var GL_BYTE = 5120
var GL_UNSIGNED_BYTE = 5121
var GL_SHORT = 5122
var GL_UNSIGNED_SHORT = 5123
var GL_INT = 5124
var GL_UNSIGNED_INT = 5125

var GL_ELEMENT_ARRAY_BUFFER = 34963

var GL_STREAM_DRAW = 0x88E0
var GL_STATIC_DRAW = 0x88E4

module.exports = function wrapElementsState (gl, extensions, bufferState, stats) {
  var elementSet = {}
  var elementCount = 0

  var elementTypes = {
    'uint8': GL_UNSIGNED_BYTE,
    'uint16': GL_UNSIGNED_SHORT
  }

  if (extensions.oes_element_index_uint) {
    elementTypes.uint32 = GL_UNSIGNED_INT
  }

  function REGLElementBuffer (buffer) {
    this.id = elementCount++
    elementSet[this.id] = this
    this.buffer = buffer
    this.primType = GL_TRIANGLES
    this.vertCount = 0
    this.type = 0
  }

  REGLElementBuffer.prototype.bind = function () {
    this.buffer.bind()
  }

  var bufferPool = []

  function createElementStream (data) {
    var result = bufferPool.pop()
    if (!result) {
      result = new REGLElementBuffer(bufferState.create(
        null,
        GL_ELEMENT_ARRAY_BUFFER,
        true,
        false)._buffer)
    }
    initElements(result, data, GL_STREAM_DRAW, -1, -1, 0, 0)
    return result
  }

  function destroyElementStream (elements) {
    bufferPool.push(elements)
  }

  function initElements (
    elements,
    data,
    usage,
    prim,
    count,
    byteLength,
    type) {
    var predictedType = type
    if (!type && (
        !isTypedArray(data) ||
       (isNDArrayLike(data) && !isTypedArray(data.data)))) {
      predictedType = extensions.oes_element_index_uint
        ? GL_UNSIGNED_INT
        : GL_UNSIGNED_SHORT
    }
    elements.buffer.bind()
    bufferState._initBuffer(
      elements.buffer,
      data,
      usage,
      predictedType,
      3)

    var dtype = type
    if (!type) {
      switch (elements.buffer.dtype) {
        case GL_UNSIGNED_BYTE:
        case GL_BYTE:
          dtype = GL_UNSIGNED_BYTE
          break

        case GL_UNSIGNED_SHORT:
        case GL_SHORT:
          dtype = GL_UNSIGNED_SHORT
          break

        case GL_UNSIGNED_INT:
        case GL_INT:
          dtype = GL_UNSIGNED_INT
          break

        default:
          
      }
      elements.buffer.dtype = dtype
    }
    elements.type = dtype

    // Check oes_element_index_uint extension
    

    // try to guess default primitive type and arguments
    var vertCount = count
    if (vertCount < 0) {
      vertCount = elements.buffer.byteLength
      if (dtype === GL_UNSIGNED_SHORT) {
        vertCount >>= 1
      } else if (dtype === GL_UNSIGNED_INT) {
        vertCount >>= 2
      }
    }
    elements.vertCount = vertCount

    // try to guess primitive type from cell dimension
    var primType = prim
    if (prim < 0) {
      primType = GL_TRIANGLES
      var dimension = elements.buffer.dimension
      if (dimension === 1) primType = GL_POINTS
      if (dimension === 2) primType = GL_LINES
      if (dimension === 3) primType = GL_TRIANGLES
    }
    elements.primType = primType
  }

  function destroyElements (elements) {
    stats.elementsCount--

    
    delete elementSet[elements.id]
    elements.buffer.destroy()
    elements.buffer = null
  }

  function createElements (options, persistent) {
    var buffer = bufferState.create(null, GL_ELEMENT_ARRAY_BUFFER, true)
    var elements = new REGLElementBuffer(buffer._buffer)
    stats.elementsCount++

    function reglElements (options) {
      if (!options) {
        buffer()
        elements.primType = GL_TRIANGLES
        elements.vertCount = 0
        elements.type = GL_UNSIGNED_BYTE
      } else if (typeof options === 'number') {
        buffer(options)
        elements.primType = GL_TRIANGLES
        elements.vertCount = options | 0
        elements.type = GL_UNSIGNED_BYTE
      } else {
        var data = null
        var usage = GL_STATIC_DRAW
        var primType = -1
        var vertCount = -1
        var byteLength = 0
        var dtype = 0
        if (Array.isArray(options) ||
            isTypedArray(options) ||
            isNDArrayLike(options)) {
          data = options
        } else {
          
          if ('data' in options) {
            data = options.data
            
          }
          if ('usage' in options) {
            
            usage = usageTypes[options.usage]
          }
          if ('primitive' in options) {
            
            primType = primTypes[options.primitive]
          }
          if ('count' in options) {
            
            vertCount = options.count | 0
          }
          if ('length' in options) {
            byteLength = options.length | 0
          }
          if ('type' in options) {
            
            dtype = elementTypes[options.type]
          }
        }
        if (data) {
          initElements(
            elements,
            data,
            usage,
            primType,
            vertCount,
            byteLength,
            dtype)
        } else {
          var _buffer = elements.buffer
          _buffer.bind()
          gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, byteLength, usage)
          _buffer.dtype = dtype || GL_UNSIGNED_BYTE
          _buffer.usage = usage
          _buffer.dimension = 3
          _buffer.byteLength = byteLength
          elements.primType = primType < 0 ? GL_TRIANGLES : primType
          elements.vertCount = vertCount < 0 ? 0 : vertCount
          elements.type = _buffer.dtype
        }
      }

      return reglElements
    }

    reglElements(options)

    reglElements._reglType = 'elements'
    reglElements._elements = elements
    reglElements.subdata = function (data, offset) {
      buffer.subdata(data, offset)
      return reglElements
    }
    reglElements.destroy = function () {
      destroyElements(elements)
    }

    return reglElements
  }

  return {
    create: createElements,
    createStream: createElementStream,
    destroyStream: destroyElementStream,
    getElements: function (elements) {
      if (typeof elements === 'function' &&
          elements._elements instanceof REGLElementBuffer) {
        return elements._elements
      }
      return null
    },
    clear: function () {
      values(elementSet).forEach(destroyElements)
    }
  }
}

},{"./constants/primitives.json":6,"./constants/usage.json":7,"./util/is-ndarray":25,"./util/is-typed-array":26,"./util/values":31}],11:[function(require,module,exports){


module.exports = function createExtensionCache (gl, config) {
  var extensions = {}

  function tryLoadExtension (name_) {
    
    var name = name_.toLowerCase()
    var ext
    try {
      ext = extensions[name] = gl.getExtension(name)
    } catch (e) {}
    return !!ext
  }

  for (var i = 0; i < config.extensions.length; ++i) {
    var name = config.extensions[i]
    if (!tryLoadExtension(name)) {
      config.onDestroy()
      config.onDone('"' + name + '" extension is not supported by the current WebGL context, try upgrading your system or a different browser')
      return null
    }
  }

  config.optionalExtensions.forEach(tryLoadExtension)

  return {
    extensions: extensions,
    restore: function () {
      Object.keys(extensions).forEach(function (name) {
        if (!tryLoadExtension(name)) {
          throw new Error('(regl): error restoring extension ' + name)
        }
      })
    }
  }
}

},{}],12:[function(require,module,exports){

var values = require('./util/values')
var extend = require('./util/extend')

// We store these constants so that the minifier can inline them
var GL_FRAMEBUFFER = 0x8D40
var GL_RENDERBUFFER = 0x8D41

var GL_TEXTURE_2D = 0x0DE1
var GL_TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515

var GL_COLOR_ATTACHMENT0 = 0x8CE0
var GL_DEPTH_ATTACHMENT = 0x8D00
var GL_STENCIL_ATTACHMENT = 0x8D20
var GL_DEPTH_STENCIL_ATTACHMENT = 0x821A

var GL_FRAMEBUFFER_COMPLETE = 0x8CD5
var GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6
var GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7
var GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9
var GL_FRAMEBUFFER_UNSUPPORTED = 0x8CDD

var GL_HALF_FLOAT_OES = 0x8D61
var GL_UNSIGNED_BYTE = 0x1401
var GL_FLOAT = 0x1406

var GL_RGBA = 0x1908

var GL_DEPTH_COMPONENT = 0x1902

var colorTextureFormatEnums = [
  GL_RGBA
]

// for every texture format, store
// the number of channels
var textureFormatChannels = []
textureFormatChannels[GL_RGBA] = 4

// for every texture type, store
// the size in bytes.
var textureTypeSizes = []
textureTypeSizes[GL_UNSIGNED_BYTE] = 1
textureTypeSizes[GL_FLOAT] = 4
textureTypeSizes[GL_HALF_FLOAT_OES] = 2

var GL_RGBA4 = 0x8056
var GL_RGB5_A1 = 0x8057
var GL_RGB565 = 0x8D62
var GL_DEPTH_COMPONENT16 = 0x81A5
var GL_STENCIL_INDEX8 = 0x8D48
var GL_DEPTH_STENCIL = 0x84F9

var GL_SRGB8_ALPHA8_EXT = 0x8C43

var GL_RGBA32F_EXT = 0x8814

var GL_RGBA16F_EXT = 0x881A
var GL_RGB16F_EXT = 0x881B

var colorRenderbufferFormatEnums = [
  GL_RGBA4,
  GL_RGB5_A1,
  GL_RGB565,
  GL_SRGB8_ALPHA8_EXT,
  GL_RGBA16F_EXT,
  GL_RGB16F_EXT,
  GL_RGBA32F_EXT
]

var statusCode = {}
statusCode[GL_FRAMEBUFFER_COMPLETE] = 'complete'
statusCode[GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT] = 'incomplete attachment'
statusCode[GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS] = 'incomplete dimensions'
statusCode[GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT] = 'incomplete, missing attachment'
statusCode[GL_FRAMEBUFFER_UNSUPPORTED] = 'unsupported'

module.exports = function wrapFBOState (
  gl,
  extensions,
  limits,
  textureState,
  renderbufferState,
  stats) {
  var framebufferState = {
    cur: null,
    next: null,
    dirty: false
  }

  var colorTextureFormats = ['rgba']
  var colorRenderbufferFormats = ['rgba4', 'rgb565', 'rgb5 a1']

  if (extensions.ext_srgb) {
    colorRenderbufferFormats.push('srgba')
  }

  if (extensions.ext_color_buffer_half_float) {
    colorRenderbufferFormats.push('rgba16f', 'rgb16f')
  }

  if (extensions.webgl_color_buffer_float) {
    colorRenderbufferFormats.push('rgba32f')
  }

  var colorTypes = ['uint8']
  if (extensions.oes_texture_half_float) {
    colorTypes.push('half float', 'float16')
  }
  if (extensions.oes_texture_float) {
    colorTypes.push('float', 'float32')
  }

  function FramebufferAttachment (target, texture, renderbuffer) {
    this.target = target
    this.texture = texture
    this.renderbuffer = renderbuffer

    var w = 0
    var h = 0
    if (texture) {
      w = texture.width
      h = texture.height
    } else if (renderbuffer) {
      w = renderbuffer.width
      h = renderbuffer.height
    }
    this.width = w
    this.height = h
  }

  function decRef (attachment) {
    if (attachment) {
      if (attachment.texture) {
        attachment.texture._texture.decRef()
      }
      if (attachment.renderbuffer) {
        attachment.renderbuffer._renderbuffer.decRef()
      }
    }
  }

  function incRefAndCheckShape (attachment, width, height) {
    if (!attachment) {
      return
    }
    if (attachment.texture) {
      var texture = attachment.texture._texture
      var tw = Math.max(1, texture.width)
      var th = Math.max(1, texture.height)
      
      texture.refCount += 1
    } else {
      var renderbuffer = attachment.renderbuffer._renderbuffer
      
      renderbuffer.refCount += 1
    }
  }

  function attach (location, attachment) {
    if (attachment) {
      if (attachment.texture) {
        gl.framebufferTexture2D(
          GL_FRAMEBUFFER,
          location,
          attachment.target,
          attachment.texture._texture.texture,
          0)
      } else {
        gl.framebufferRenderbuffer(
          GL_FRAMEBUFFER,
          location,
          GL_RENDERBUFFER,
          attachment.renderbuffer._renderbuffer.renderbuffer)
      }
    } else {
      gl.framebufferTexture2D(
        GL_FRAMEBUFFER,
        location,
        GL_TEXTURE_2D,
        null,
        0)
    }
  }

  function parseAttachment (attachment) {
    var target = GL_TEXTURE_2D
    var texture = null
    var renderbuffer = null

    var data = attachment
    if (typeof attachment === 'object') {
      data = attachment.data
      if ('target' in attachment) {
        target = attachment.target | 0
      }
    }

    

    var type = data._reglType
    if (type === 'texture2d') {
      texture = data
      
    } else if (type === 'textureCube') {
      texture = data
      
    } else if (type === 'renderbuffer') {
      renderbuffer = data
      target = GL_RENDERBUFFER
    } else {
      
    }

    return new FramebufferAttachment(target, texture, renderbuffer)
  }

  function allocAttachment (
    width,
    height,
    isTexture,
    format,
    type) {
    if (isTexture) {
      var texture = textureState.create2D({
        width: width,
        height: height,
        format: format,
        type: type
      })
      texture._texture.refCount = 0
      return new FramebufferAttachment(GL_TEXTURE_2D, texture, null)
    } else {
      var rb = renderbufferState.create({
        width: width,
        height: height,
        format: format
      })
      rb._renderbuffer.refCount = 0
      return new FramebufferAttachment(GL_RENDERBUFFER, null, rb)
    }
  }

  function unwrapAttachment (attachment) {
    return attachment && (attachment.texture || attachment.renderbuffer)
  }

  function resizeAttachment (attachment, w, h) {
    if (attachment) {
      if (attachment.texture) {
        attachment.texture.resize(w, h)
      } else if (attachment.renderbuffer) {
        attachment.renderbuffer.resize(w, h)
      }
    }
  }

  var framebufferCount = 0
  var framebufferSet = {}

  function REGLFramebuffer () {
    this.id = framebufferCount++
    framebufferSet[this.id] = this

    this.framebuffer = gl.createFramebuffer()
    this.width = 0
    this.height = 0

    this.colorAttachments = []
    this.depthAttachment = null
    this.stencilAttachment = null
    this.depthStencilAttachment = null
  }

  function decFBORefs (framebuffer) {
    framebuffer.colorAttachments.forEach(decRef)
    decRef(framebuffer.depthAttachment)
    decRef(framebuffer.stencilAttachment)
    decRef(framebuffer.depthStencilAttachment)
  }

  function destroy (framebuffer) {
    var handle = framebuffer.framebuffer
    
    gl.deleteFramebuffer(handle)
    framebuffer.framebuffer = null
    stats.framebufferCount--
    delete framebufferSet[framebuffer.id]
  }

  function updateFramebuffer (framebuffer) {
    var i

    gl.bindFramebuffer(GL_FRAMEBUFFER, framebuffer.framebuffer)
    var colorAttachments = framebuffer.colorAttachments
    for (i = 0; i < colorAttachments.length; ++i) {
      attach(GL_COLOR_ATTACHMENT0 + i, colorAttachments[i])
    }
    for (i = colorAttachments.length; i < limits.maxColorAttachments; ++i) {
      attach(GL_COLOR_ATTACHMENT0 + i, null)
    }
    attach(GL_DEPTH_ATTACHMENT, framebuffer.depthAttachment)
    attach(GL_STENCIL_ATTACHMENT, framebuffer.stencilAttachment)
    attach(GL_DEPTH_STENCIL_ATTACHMENT, framebuffer.depthStencilAttachment)

    // Check status code
    var status = gl.checkFramebufferStatus(GL_FRAMEBUFFER)
    if (status !== GL_FRAMEBUFFER_COMPLETE) {
      
    }

    gl.bindFramebuffer(GL_FRAMEBUFFER, framebufferState.next)
    framebufferState.cur = framebufferState.next

    // FIXME: Clear error code here.  This is a work around for a bug in
    // headless-gl
    gl.getError()
  }

  function createFBO (a0, a1) {
    var framebuffer = new REGLFramebuffer()
    stats.framebufferCount++

    function reglFramebuffer (a, b) {
      var i

      

      var extDrawBuffers = extensions.webgl_draw_buffers

      var width = 0
      var height = 0

      var needsDepth = true
      var needsStencil = true

      var colorBuffer = null
      var colorTexture = true
      var colorFormat = 'rgba'
      var colorType = 'uint8'
      var colorCount = 1

      var depthBuffer = null
      var stencilBuffer = null
      var depthStencilBuffer = null
      var depthStencilTexture = false

      if (typeof a === 'number') {
        width = a | 0
        height = (b | 0) || width
      } else if (!a) {
        width = height = 1
      } else {
        
        var options = a

        if ('shape' in options) {
          var shape = options.shape
          
          width = shape[0]
          height = shape[1]
        } else {
          if ('radius' in options) {
            width = height = options.radius
          }
          if ('width' in options) {
            width = options.width
          }
          if ('height' in options) {
            height = options.height
          }
        }

        if ('color' in options ||
            'colors' in options) {
          colorBuffer =
            options.color ||
            options.colors
          if (Array.isArray(colorBuffer)) {
            
          }
        }

        if (!colorBuffer) {
          if ('colorCount' in options) {
            colorCount = options.colorCount | 0
            
          }

          if ('colorTexture' in options) {
            colorTexture = !!options.colorTexture
            colorFormat = 'rgba4'
          }

          if ('colorType' in options) {
            colorType = options.colorType
            if (!colorTexture) {
              if (colorType === 'half float' || colorType === 'float16') {
                
                colorFormat = 'rgba16f'
              } else if (colorType === 'float' || colorType === 'float32') {
                
                colorFormat = 'rgba32f'
              }
            } else {
              
              
            }
            
          }

          if ('colorFormat' in options) {
            colorFormat = options.colorFormat
            if (colorTextureFormats.indexOf(colorFormat) >= 0) {
              colorTexture = true
            } else if (colorRenderbufferFormats.indexOf(colorFormat) >= 0) {
              colorTexture = false
            } else {
              if (colorTexture) {
                
              } else {
                
              }
            }
          }
        }

        if ('depthTexture' in options || 'depthStencilTexture' in options) {
          depthStencilTexture = !!(options.depthTexture ||
            options.depthStencilTexture)
          
        }

        if ('depth' in options) {
          if (typeof options.depth === 'boolean') {
            needsDepth = options.depth
          } else {
            depthBuffer = options.depth
            needsStencil = false
          }
        }

        if ('stencil' in options) {
          if (typeof options.stencil === 'boolean') {
            needsStencil = options.stencil
          } else {
            stencilBuffer = options.stencil
            needsDepth = false
          }
        }

        if ('depthStencil' in options) {
          if (typeof options.depthStencil === 'boolean') {
            needsDepth = needsStencil = options.depthStencil
          } else {
            depthStencilBuffer = options.depthStencil
            needsDepth = false
            needsStencil = false
          }
        }
      }

      // parse attachments
      var colorAttachments = null
      var depthAttachment = null
      var stencilAttachment = null
      var depthStencilAttachment = null

      // Set up color attachments
      if (Array.isArray(colorBuffer)) {
        colorAttachments = colorBuffer.map(parseAttachment)
      } else if (colorBuffer) {
        colorAttachments = [parseAttachment(colorBuffer)]
      } else {
        colorAttachments = new Array(colorCount)
        for (i = 0; i < colorCount; ++i) {
          colorAttachments[i] = allocAttachment(
            width,
            height,
            colorTexture,
            colorFormat,
            colorType)
        }
      }

      
      

      width = width || colorAttachments[0].width
      height = height || colorAttachments[0].height

      if (depthBuffer) {
        depthAttachment = parseAttachment(depthBuffer)
      } else if (needsDepth && !needsStencil) {
        depthAttachment = allocAttachment(
          width,
          height,
          depthStencilTexture,
          'depth',
          'uint32')
      }

      if (stencilBuffer) {
        stencilAttachment = parseAttachment(stencilBuffer)
      } else if (needsStencil && !needsDepth) {
        stencilAttachment = allocAttachment(
          width,
          height,
          false,
          'stencil',
          'uint8')
      }

      if (depthStencilBuffer) {
        depthStencilAttachment = parseAttachment(depthStencilBuffer)
      } else if (!depthBuffer && !stencilBuffer && needsStencil && needsDepth) {
        depthStencilAttachment = allocAttachment(
          width,
          height,
          depthStencilTexture,
          'depth stencil',
          'depth stencil')
      }

      

      var commonColorAttachmentSize = null

      for (i = 0; i < colorAttachments.length; ++i) {
        incRefAndCheckShape(colorAttachments[i], width, height)
        

        if (colorAttachments[i] && colorAttachments[i].texture) {
          var colorAttachmentSize =
              textureFormatChannels[colorAttachments[i].texture._texture.format] *
              textureTypeSizes[colorAttachments[i].texture._texture.type]

          if (commonColorAttachmentSize === null) {
            commonColorAttachmentSize = colorAttachmentSize
          } else {
            // We need to make sure that all color attachments have the same number of bitplanes
            // (that is, the same numer of bits per pixel)
            // This is required by the GLES2.0 standard. See the beginning of Chapter 4 in that document.
            
          }
        }
      }
      incRefAndCheckShape(depthAttachment, width, height)
      
      incRefAndCheckShape(stencilAttachment, width, height)
      
      incRefAndCheckShape(depthStencilAttachment, width, height)
      

      // decrement references
      decFBORefs(framebuffer)

      framebuffer.width = width
      framebuffer.height = height

      framebuffer.colorAttachments = colorAttachments
      framebuffer.depthAttachment = depthAttachment
      framebuffer.stencilAttachment = stencilAttachment
      framebuffer.depthStencilAttachment = depthStencilAttachment

      reglFramebuffer.color = colorAttachments.map(unwrapAttachment)
      reglFramebuffer.depth = unwrapAttachment(depthAttachment)
      reglFramebuffer.stencil = unwrapAttachment(stencilAttachment)
      reglFramebuffer.depthStencil = unwrapAttachment(depthStencilAttachment)

      reglFramebuffer.width = framebuffer.width
      reglFramebuffer.height = framebuffer.height

      updateFramebuffer(framebuffer)

      return reglFramebuffer
    }

    function resize (w_, h_) {
      

      var w = w_ | 0
      var h = (h_ | 0) || w
      if (w === framebuffer.width && h === framebuffer.height) {
        return reglFramebuffer
      }

      // resize all buffers
      var colorAttachments = framebuffer.colorAttachments
      for (var i = 0; i < colorAttachments.length; ++i) {
        resizeAttachment(colorAttachments[i], w, h)
      }
      resizeAttachment(framebuffer.depthAttachment, w, h)
      resizeAttachment(framebuffer.stencilAttachment, w, h)
      resizeAttachment(framebuffer.depthStencilAttachment, w, h)

      framebuffer.width = reglFramebuffer.width = w
      framebuffer.height = reglFramebuffer.height = h

      updateFramebuffer(framebuffer)

      return reglFramebuffer
    }

    reglFramebuffer(a0, a1)

    return extend(reglFramebuffer, {
      resize: resize,
      _reglType: 'framebuffer',
      _framebuffer: framebuffer,
      destroy: function () {
        destroy(framebuffer)
        decFBORefs(framebuffer)
      }
    })
  }

  function createCubeFBO (options) {
    var faces = Array(6)

    function reglFramebufferCube (a) {
      var i

      

      var extDrawBuffers = extensions.webgl_draw_buffers

      var params = {
        color: null
      }

      var radius = 0

      var colorBuffer = null
      var colorFormat = 'rgba'
      var colorType = 'uint8'
      var colorCount = 1

      if (typeof a === 'number') {
        radius = a | 0
      } else if (!a) {
        radius = 1
      } else {
        
        var options = a

        if ('shape' in options) {
          var shape = options.shape
          
          
          radius = shape[0]
        } else {
          if ('radius' in options) {
            radius = options.radius | 0
          }
          if ('width' in options) {
            radius = options.width | 0
            if ('height' in options) {
              
            }
          } else if ('height' in options) {
            radius = options.height | 0
          }
        }

        if ('color' in options ||
            'colors' in options) {
          colorBuffer =
            options.color ||
            options.colors
          if (Array.isArray(colorBuffer)) {
            
          }
        }

        if (!colorBuffer) {
          if ('colorCount' in options) {
            colorCount = options.colorCount | 0
            
          }

          if ('colorType' in options) {
            
            colorType = options.colorType
          }

          if ('colorFormat' in options) {
            colorFormat = options.colorFormat
            
          }
        }

        if ('depth' in options) {
          params.depth = options.depth
        }

        if ('stencil' in options) {
          params.stencil = options.stencil
        }

        if ('depthStencil' in options) {
          params.depthStencil = options.depthStencil
        }
      }

      var colorCubes
      if (colorBuffer) {
        if (Array.isArray(colorBuffer)) {
          colorCubes = []
          for (i = 0; i < colorBuffer.length; ++i) {
            colorCubes[i] = colorBuffer[i]
          }
        } else {
          colorCubes = [ colorBuffer ]
        }
      } else {
        colorCubes = Array(colorCount)
        var cubeMapParams = {
          radius: radius,
          format: colorFormat,
          type: colorType
        }
        for (i = 0; i < colorCount; ++i) {
          colorCubes[i] = textureState.createCube(cubeMapParams)
        }
      }

      // Check color cubes
      params.color = Array(colorCubes.length)
      for (i = 0; i < colorCubes.length; ++i) {
        var cube = colorCubes[i]
        
        radius = radius || cube.width
        
        params.color[i] = {
          target: GL_TEXTURE_CUBE_MAP_POSITIVE_X,
          data: colorCubes[i]
        }
      }

      for (i = 0; i < 6; ++i) {
        for (var j = 0; j < colorCubes.length; ++j) {
          params.color[j].target = GL_TEXTURE_CUBE_MAP_POSITIVE_X + i
        }
        // reuse depth-stencil attachments across all cube maps
        if (i > 0) {
          params.depth = faces[0].depth
          params.stencil = faces[0].stencil
          params.depthStencil = faces[0].depthStencil
        }
        if (faces[i]) {
          (faces[i])(params)
        } else {
          faces[i] = createFBO(params)
        }
      }

      return extend(reglFramebufferCube, {
        width: radius,
        height: radius,
        color: colorCubes
      })
    }

    function resize (radius_) {
      var i
      var radius = radius_ | 0
      

      if (radius === reglFramebufferCube.width) {
        return reglFramebufferCube
      }

      var colors = reglFramebufferCube.color
      for (i = 0; i < colors.length; ++i) {
        colors[i].resize(radius)
      }

      for (i = 0; i < 6; ++i) {
        faces[i].resize(radius)
      }

      reglFramebufferCube.width = reglFramebufferCube.height = radius

      return reglFramebufferCube
    }

    reglFramebufferCube(options)

    return extend(reglFramebufferCube, {
      faces: faces,
      resize: resize,
      _reglType: 'framebufferCube',
      destroy: function () {
        faces.forEach(function (f) {
          f.destroy()
        })
      }
    })
  }

  function restoreFramebuffers () {
    values(framebufferSet).forEach(function (fb) {
      fb.framebuffer = gl.createFramebuffer()
      updateFramebuffer(fb)
    })
  }

  return extend(framebufferState, {
    getFramebuffer: function (object) {
      if (typeof object === 'function' && object._reglType === 'framebuffer') {
        var fbo = object._framebuffer
        if (fbo instanceof REGLFramebuffer) {
          return fbo
        }
      }
      return null
    },
    create: createFBO,
    createCube: createCubeFBO,
    clear: function () {
      values(framebufferSet).forEach(destroy)
    },
    restore: restoreFramebuffers
  })
}

},{"./util/extend":23,"./util/values":31}],13:[function(require,module,exports){
var GL_SUBPIXEL_BITS = 0x0D50
var GL_RED_BITS = 0x0D52
var GL_GREEN_BITS = 0x0D53
var GL_BLUE_BITS = 0x0D54
var GL_ALPHA_BITS = 0x0D55
var GL_DEPTH_BITS = 0x0D56
var GL_STENCIL_BITS = 0x0D57

var GL_ALIASED_POINT_SIZE_RANGE = 0x846D
var GL_ALIASED_LINE_WIDTH_RANGE = 0x846E

var GL_MAX_TEXTURE_SIZE = 0x0D33
var GL_MAX_VIEWPORT_DIMS = 0x0D3A
var GL_MAX_VERTEX_ATTRIBS = 0x8869
var GL_MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB
var GL_MAX_VARYING_VECTORS = 0x8DFC
var GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D
var GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C
var GL_MAX_TEXTURE_IMAGE_UNITS = 0x8872
var GL_MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD
var GL_MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C
var GL_MAX_RENDERBUFFER_SIZE = 0x84E8

var GL_VENDOR = 0x1F00
var GL_RENDERER = 0x1F01
var GL_VERSION = 0x1F02
var GL_SHADING_LANGUAGE_VERSION = 0x8B8C

var GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF

var GL_MAX_COLOR_ATTACHMENTS_WEBGL = 0x8CDF
var GL_MAX_DRAW_BUFFERS_WEBGL = 0x8824

module.exports = function (gl, extensions) {
  var maxAnisotropic = 1
  if (extensions.ext_texture_filter_anisotropic) {
    maxAnisotropic = gl.getParameter(GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT)
  }

  var maxDrawbuffers = 1
  var maxColorAttachments = 1
  if (extensions.webgl_draw_buffers) {
    maxDrawbuffers = gl.getParameter(GL_MAX_DRAW_BUFFERS_WEBGL)
    maxColorAttachments = gl.getParameter(GL_MAX_COLOR_ATTACHMENTS_WEBGL)
  }

  return {
    // drawing buffer bit depth
    colorBits: [
      gl.getParameter(GL_RED_BITS),
      gl.getParameter(GL_GREEN_BITS),
      gl.getParameter(GL_BLUE_BITS),
      gl.getParameter(GL_ALPHA_BITS)
    ],
    depthBits: gl.getParameter(GL_DEPTH_BITS),
    stencilBits: gl.getParameter(GL_STENCIL_BITS),
    subpixelBits: gl.getParameter(GL_SUBPIXEL_BITS),

    // supported extensions
    extensions: Object.keys(extensions).filter(function (ext) {
      return !!extensions[ext]
    }),

    // max aniso samples
    maxAnisotropic: maxAnisotropic,

    // max draw buffers
    maxDrawbuffers: maxDrawbuffers,
    maxColorAttachments: maxColorAttachments,

    // point and line size ranges
    pointSizeDims: gl.getParameter(GL_ALIASED_POINT_SIZE_RANGE),
    lineWidthDims: gl.getParameter(GL_ALIASED_LINE_WIDTH_RANGE),
    maxViewportDims: gl.getParameter(GL_MAX_VIEWPORT_DIMS),
    maxCombinedTextureUnits: gl.getParameter(GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS),
    maxCubeMapSize: gl.getParameter(GL_MAX_CUBE_MAP_TEXTURE_SIZE),
    maxRenderbufferSize: gl.getParameter(GL_MAX_RENDERBUFFER_SIZE),
    maxTextureUnits: gl.getParameter(GL_MAX_TEXTURE_IMAGE_UNITS),
    maxTextureSize: gl.getParameter(GL_MAX_TEXTURE_SIZE),
    maxAttributes: gl.getParameter(GL_MAX_VERTEX_ATTRIBS),
    maxVertexUniforms: gl.getParameter(GL_MAX_VERTEX_UNIFORM_VECTORS),
    maxVertexTextureUnits: gl.getParameter(GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    maxVaryingVectors: gl.getParameter(GL_MAX_VARYING_VECTORS),
    maxFragmentUniforms: gl.getParameter(GL_MAX_FRAGMENT_UNIFORM_VECTORS),

    // vendor info
    glsl: gl.getParameter(GL_SHADING_LANGUAGE_VERSION),
    renderer: gl.getParameter(GL_RENDERER),
    vendor: gl.getParameter(GL_VENDOR),
    version: gl.getParameter(GL_VERSION)
  }
}

},{}],14:[function(require,module,exports){

var isTypedArray = require('./util/is-typed-array')

var GL_RGBA = 6408
var GL_UNSIGNED_BYTE = 5121
var GL_PACK_ALIGNMENT = 0x0D05
var GL_FLOAT = 0x1406 // 5126

module.exports = function wrapReadPixels (
  gl,
  framebufferState,
  reglPoll,
  context,
  glAttributes,
  extensions) {
  function readPixels (input) {
    var type
    if (framebufferState.next === null) {
      
      type = GL_UNSIGNED_BYTE
    } else {
      
      type = framebufferState.next.colorAttachments[0].texture._texture.type

      if (extensions.oes_texture_float) {
        
      } else {
        
      }
    }

    var x = 0
    var y = 0
    var width = context.framebufferWidth
    var height = context.framebufferHeight
    var data = null

    if (isTypedArray(input)) {
      data = input
    } else if (input) {
      
      x = input.x | 0
      y = input.y | 0
      
      
      width = (input.width || (context.framebufferWidth - x)) | 0
      height = (input.height || (context.framebufferHeight - y)) | 0
      data = input.data || null
    }

    // sanity check input.data
    if (data) {
      if (type === GL_UNSIGNED_BYTE) {
        
      } else if (type === GL_FLOAT) {
        
      }
    }

    
    

    // Update WebGL state
    reglPoll()

    // Compute size
    var size = width * height * 4

    // Allocate data
    if (!data) {
      if (type === GL_UNSIGNED_BYTE) {
        data = new Uint8Array(size)
      } else if (type === GL_FLOAT) {
        data = data || new Float32Array(size)
      }
    }

    // Type check
    
    

    // Run read pixels
    gl.pixelStorei(GL_PACK_ALIGNMENT, 4)
    gl.readPixels(x, y, width, height, GL_RGBA,
                  type,
                  data)

    return data
  }

  return readPixels
}

},{"./util/is-typed-array":26}],15:[function(require,module,exports){

var values = require('./util/values')

var GL_RENDERBUFFER = 0x8D41

var GL_RGBA4 = 0x8056
var GL_RGB5_A1 = 0x8057
var GL_RGB565 = 0x8D62
var GL_DEPTH_COMPONENT16 = 0x81A5
var GL_STENCIL_INDEX8 = 0x8D48
var GL_DEPTH_STENCIL = 0x84F9

var GL_SRGB8_ALPHA8_EXT = 0x8C43

var GL_RGBA32F_EXT = 0x8814

var GL_RGBA16F_EXT = 0x881A
var GL_RGB16F_EXT = 0x881B

var FORMAT_SIZES = []

FORMAT_SIZES[GL_RGBA4] = 2
FORMAT_SIZES[GL_RGB5_A1] = 2
FORMAT_SIZES[GL_RGB565] = 2

FORMAT_SIZES[GL_DEPTH_COMPONENT16] = 2
FORMAT_SIZES[GL_STENCIL_INDEX8] = 1
FORMAT_SIZES[GL_DEPTH_STENCIL] = 4

FORMAT_SIZES[GL_SRGB8_ALPHA8_EXT] = 4
FORMAT_SIZES[GL_RGBA32F_EXT] = 16
FORMAT_SIZES[GL_RGBA16F_EXT] = 8
FORMAT_SIZES[GL_RGB16F_EXT] = 6

function getRenderbufferSize (format, width, height) {
  return FORMAT_SIZES[format] * width * height
}

module.exports = function (gl, extensions, limits, stats, config) {
  var formatTypes = {
    'rgba4': GL_RGBA4,
    'rgb565': GL_RGB565,
    'rgb5 a1': GL_RGB5_A1,
    'depth': GL_DEPTH_COMPONENT16,
    'stencil': GL_STENCIL_INDEX8,
    'depth stencil': GL_DEPTH_STENCIL
  }

  if (extensions.ext_srgb) {
    formatTypes['srgba'] = GL_SRGB8_ALPHA8_EXT
  }

  if (extensions.ext_color_buffer_half_float) {
    formatTypes['rgba16f'] = GL_RGBA16F_EXT
    formatTypes['rgb16f'] = GL_RGB16F_EXT
  }

  if (extensions.webgl_color_buffer_float) {
    formatTypes['rgba32f'] = GL_RGBA32F_EXT
  }

  var renderbufferCount = 0
  var renderbufferSet = {}

  function REGLRenderbuffer (renderbuffer) {
    this.id = renderbufferCount++
    this.refCount = 1

    this.renderbuffer = renderbuffer

    this.format = GL_RGBA4
    this.width = 0
    this.height = 0

    if (config.profile) {
      this.stats = {size: 0}
    }
  }

  REGLRenderbuffer.prototype.decRef = function () {
    if (--this.refCount <= 0) {
      destroy(this)
    }
  }

  function destroy (rb) {
    var handle = rb.renderbuffer
    
    gl.bindRenderbuffer(GL_RENDERBUFFER, null)
    gl.deleteRenderbuffer(handle)
    rb.renderbuffer = null
    rb.refCount = 0
    delete renderbufferSet[rb.id]
    stats.renderbufferCount--
  }

  function createRenderbuffer (a, b) {
    var renderbuffer = new REGLRenderbuffer(gl.createRenderbuffer())
    renderbufferSet[renderbuffer.id] = renderbuffer
    stats.renderbufferCount++

    function reglRenderbuffer (a, b) {
      var w = 0
      var h = 0
      var format = GL_RGBA4

      if (typeof a === 'object' && a) {
        var options = a
        if ('shape' in options) {
          var shape = options.shape
          
          w = shape[0] | 0
          h = shape[1] | 0
        } else {
          if ('radius' in options) {
            w = h = options.radius | 0
          }
          if ('width' in options) {
            w = options.width | 0
          }
          if ('height' in options) {
            h = options.height | 0
          }
        }
        if ('format' in options) {
          
          format = formatTypes[options.format]
        }
      } else if (typeof a === 'number') {
        w = a | 0
        if (typeof b === 'number') {
          h = b | 0
        } else {
          h = w
        }
      } else if (!a) {
        w = h = 1
      } else {
        
      }

      // check shape
      

      if (w === renderbuffer.width &&
          h === renderbuffer.height &&
          format === renderbuffer.format) {
        return
      }

      reglRenderbuffer.width = renderbuffer.width = w
      reglRenderbuffer.height = renderbuffer.height = h
      renderbuffer.format = format

      gl.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer.renderbuffer)
      gl.renderbufferStorage(GL_RENDERBUFFER, format, w, h)

      if (config.profile) {
        renderbuffer.stats.size = getRenderbufferSize(renderbuffer.format, renderbuffer.width, renderbuffer.height)
      }

      return reglRenderbuffer
    }

    function resize (w_, h_) {
      var w = w_ | 0
      var h = (h_ | 0) || w

      if (w === renderbuffer.width && h === renderbuffer.height) {
        return reglRenderbuffer
      }

      // check shape
      

      reglRenderbuffer.width = renderbuffer.width = w
      reglRenderbuffer.height = renderbuffer.height = h

      gl.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer.renderbuffer)
      gl.renderbufferStorage(GL_RENDERBUFFER, renderbuffer.format, w, h)

      // also, recompute size.
      if (config.profile) {
        renderbuffer.stats.size = getRenderbufferSize(
          renderbuffer.format, renderbuffer.width, renderbuffer.height)
      }

      return reglRenderbuffer
    }

    reglRenderbuffer(a, b)

    reglRenderbuffer.resize = resize
    reglRenderbuffer._reglType = 'renderbuffer'
    reglRenderbuffer._renderbuffer = renderbuffer
    if (config.profile) {
      reglRenderbuffer.stats = renderbuffer.stats
    }
    reglRenderbuffer.destroy = function () {
      renderbuffer.decRef()
    }

    return reglRenderbuffer
  }

  if (config.profile) {
    stats.getTotalRenderbufferSize = function () {
      var total = 0
      Object.keys(renderbufferSet).forEach(function (key) {
        total += renderbufferSet[key].stats.size
      })
      return total
    }
  }

  function restoreRenderbuffers () {
    values(renderbufferSet).forEach(function (rb) {
      rb.renderbuffer = gl.createRenderbuffer()
      gl.bindRenderbuffer(GL_RENDERBUFFER, rb.renderbuffer)
      gl.renderbufferStorage(GL_RENDERBUFFER, rb.format, rb.width, rb.height)
    })
    gl.bindRenderbuffer(GL_RENDERBUFFER, null)
  }

  return {
    create: createRenderbuffer,
    clear: function () {
      values(renderbufferSet).forEach(destroy)
    },
    restore: restoreRenderbuffers
  }
}

},{"./util/values":31}],16:[function(require,module,exports){

var values = require('./util/values')

var GL_FRAGMENT_SHADER = 35632
var GL_VERTEX_SHADER = 35633

var GL_ACTIVE_UNIFORMS = 0x8B86
var GL_ACTIVE_ATTRIBUTES = 0x8B89

module.exports = function wrapShaderState (gl, stringStore, stats, config) {
  // ===================================================
  // glsl compilation and linking
  // ===================================================
  var fragShaders = {}
  var vertShaders = {}

  function ActiveInfo (name, id, location, info) {
    this.name = name
    this.id = id
    this.location = location
    this.info = info
  }

  function insertActiveInfo (list, info) {
    for (var i = 0; i < list.length; ++i) {
      if (list[i].id === info.id) {
        list[i].location = info.location
        return
      }
    }
    list.push(info)
  }

  function getShader (type, id, command) {
    var cache = type === GL_FRAGMENT_SHADER ? fragShaders : vertShaders
    var shader = cache[id]

    if (!shader) {
      var source = stringStore.str(id)
      shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      
      cache[id] = shader
    }

    return shader
  }

  // ===================================================
  // program linking
  // ===================================================
  var programCache = {}
  var programList = []

  var PROGRAM_COUNTER = 0

  function REGLProgram (fragId, vertId) {
    this.id = PROGRAM_COUNTER++
    this.fragId = fragId
    this.vertId = vertId
    this.program = null
    this.uniforms = []
    this.attributes = []

    if (config.profile) {
      this.stats = {
        uniformsCount: 0,
        attributesCount: 0
      }
    }
  }

  function linkProgram (desc, command) {
    var i, info

    // -------------------------------
    // compile & link
    // -------------------------------
    var fragShader = getShader(GL_FRAGMENT_SHADER, desc.fragId)
    var vertShader = getShader(GL_VERTEX_SHADER, desc.vertId)

    var program = desc.program = gl.createProgram()
    gl.attachShader(program, fragShader)
    gl.attachShader(program, vertShader)
    gl.linkProgram(program)
    

    // -------------------------------
    // grab uniforms
    // -------------------------------
    var numUniforms = gl.getProgramParameter(program, GL_ACTIVE_UNIFORMS)
    if (config.profile) {
      desc.stats.uniformsCount = numUniforms
    }
    var uniforms = desc.uniforms
    for (i = 0; i < numUniforms; ++i) {
      info = gl.getActiveUniform(program, i)
      if (info) {
        if (info.size > 1) {
          for (var j = 0; j < info.size; ++j) {
            var name = info.name.replace('[0]', '[' + j + ']')
            insertActiveInfo(uniforms, new ActiveInfo(
              name,
              stringStore.id(name),
              gl.getUniformLocation(program, name),
              info))
          }
        } else {
          insertActiveInfo(uniforms, new ActiveInfo(
            info.name,
            stringStore.id(info.name),
            gl.getUniformLocation(program, info.name),
            info))
        }
      }
    }

    // -------------------------------
    // grab attributes
    // -------------------------------
    var numAttributes = gl.getProgramParameter(program, GL_ACTIVE_ATTRIBUTES)
    if (config.profile) {
      desc.stats.attributesCount = numAttributes
    }

    var attributes = desc.attributes
    for (i = 0; i < numAttributes; ++i) {
      info = gl.getActiveAttrib(program, i)
      if (info) {
        insertActiveInfo(attributes, new ActiveInfo(
          info.name,
          stringStore.id(info.name),
          gl.getAttribLocation(program, info.name),
          info))
      }
    }
  }

  if (config.profile) {
    stats.getMaxUniformsCount = function () {
      var m = 0
      programList.forEach(function (desc) {
        if (desc.stats.uniformsCount > m) {
          m = desc.stats.uniformsCount
        }
      })
      return m
    }

    stats.getMaxAttributesCount = function () {
      var m = 0
      programList.forEach(function (desc) {
        if (desc.stats.attributesCount > m) {
          m = desc.stats.attributesCount
        }
      })
      return m
    }
  }

  function restoreShaders () {
    fragShaders = {}
    vertShaders = {}
    for (var i = 0; i < programList.length; ++i) {
      linkProgram(programList[i])
    }
  }

  return {
    clear: function () {
      var deleteShader = gl.deleteShader.bind(gl)
      values(fragShaders).forEach(deleteShader)
      fragShaders = {}
      values(vertShaders).forEach(deleteShader)
      vertShaders = {}

      programList.forEach(function (desc) {
        gl.deleteProgram(desc.program)
      })
      programList.length = 0
      programCache = {}

      stats.shaderCount = 0
    },

    program: function (vertId, fragId, command) {
      
      

      stats.shaderCount++

      var cache = programCache[fragId]
      if (!cache) {
        cache = programCache[fragId] = {}
      }
      var program = cache[vertId]
      if (!program) {
        program = new REGLProgram(fragId, vertId)
        linkProgram(program, command)
        cache[vertId] = program
        programList.push(program)
      }
      return program
    },

    restore: restoreShaders,

    shader: getShader,

    frag: -1,
    vert: -1
  }
}

},{"./util/values":31}],17:[function(require,module,exports){

module.exports = function stats () {
  return {
    bufferCount: 0,
    elementsCount: 0,
    framebufferCount: 0,
    shaderCount: 0,
    textureCount: 0,
    cubeCount: 0,
    renderbufferCount: 0,

    maxTextureUnits: 0
  }
}

},{}],18:[function(require,module,exports){
module.exports = function createStringStore () {
  var stringIds = {'': 0}
  var stringValues = ['']
  return {
    id: function (str) {
      var result = stringIds[str]
      if (result) {
        return result
      }
      result = stringIds[str] = stringValues.length
      stringValues.push(str)
      return result
    },

    str: function (id) {
      return stringValues[id]
    }
  }
}

},{}],19:[function(require,module,exports){

var extend = require('./util/extend')
var values = require('./util/values')
var isTypedArray = require('./util/is-typed-array')
var isNDArrayLike = require('./util/is-ndarray')
var pool = require('./util/pool')
var convertToHalfFloat = require('./util/to-half-float')
var isArrayLike = require('./util/is-array-like')

var dtypes = require('./constants/arraytypes.json')
var arrayTypes = require('./constants/arraytypes.json')

var GL_COMPRESSED_TEXTURE_FORMATS = 0x86A3

var GL_TEXTURE_2D = 0x0DE1
var GL_TEXTURE_CUBE_MAP = 0x8513
var GL_TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515

var GL_RGBA = 0x1908
var GL_ALPHA = 0x1906
var GL_RGB = 0x1907
var GL_LUMINANCE = 0x1909
var GL_LUMINANCE_ALPHA = 0x190A

var GL_RGBA4 = 0x8056
var GL_RGB5_A1 = 0x8057
var GL_RGB565 = 0x8D62

var GL_UNSIGNED_SHORT_4_4_4_4 = 0x8033
var GL_UNSIGNED_SHORT_5_5_5_1 = 0x8034
var GL_UNSIGNED_SHORT_5_6_5 = 0x8363
var GL_UNSIGNED_INT_24_8_WEBGL = 0x84FA

var GL_DEPTH_COMPONENT = 0x1902
var GL_DEPTH_STENCIL = 0x84F9

var GL_SRGB_EXT = 0x8C40
var GL_SRGB_ALPHA_EXT = 0x8C42

var GL_HALF_FLOAT_OES = 0x8D61

var GL_COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0
var GL_COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1
var GL_COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2
var GL_COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3

var GL_COMPRESSED_RGB_ATC_WEBGL = 0x8C92
var GL_COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 0x8C93
var GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 0x87EE

var GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00
var GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01
var GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02
var GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03

var GL_COMPRESSED_RGB_ETC1_WEBGL = 0x8D64

var GL_UNSIGNED_BYTE = 0x1401
var GL_UNSIGNED_SHORT = 0x1403
var GL_UNSIGNED_INT = 0x1405
var GL_FLOAT = 0x1406

var GL_TEXTURE_WRAP_S = 0x2802
var GL_TEXTURE_WRAP_T = 0x2803

var GL_REPEAT = 0x2901
var GL_CLAMP_TO_EDGE = 0x812F
var GL_MIRRORED_REPEAT = 0x8370

var GL_TEXTURE_MAG_FILTER = 0x2800
var GL_TEXTURE_MIN_FILTER = 0x2801

var GL_NEAREST = 0x2600
var GL_LINEAR = 0x2601
var GL_NEAREST_MIPMAP_NEAREST = 0x2700
var GL_LINEAR_MIPMAP_NEAREST = 0x2701
var GL_NEAREST_MIPMAP_LINEAR = 0x2702
var GL_LINEAR_MIPMAP_LINEAR = 0x2703

var GL_GENERATE_MIPMAP_HINT = 0x8192
var GL_DONT_CARE = 0x1100
var GL_FASTEST = 0x1101
var GL_NICEST = 0x1102

var GL_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE

var GL_UNPACK_ALIGNMENT = 0x0CF5
var GL_UNPACK_FLIP_Y_WEBGL = 0x9240
var GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241
var GL_UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243

var GL_BROWSER_DEFAULT_WEBGL = 0x9244

var GL_TEXTURE0 = 0x84C0

var MIPMAP_FILTERS = [
  GL_NEAREST_MIPMAP_NEAREST,
  GL_NEAREST_MIPMAP_LINEAR,
  GL_LINEAR_MIPMAP_NEAREST,
  GL_LINEAR_MIPMAP_LINEAR
]

var CHANNELS_FORMAT = [
  0,
  GL_LUMINANCE,
  GL_LUMINANCE_ALPHA,
  GL_RGB,
  GL_RGBA
]

var FORMAT_CHANNELS = {}
FORMAT_CHANNELS[GL_LUMINANCE] =
FORMAT_CHANNELS[GL_ALPHA] =
FORMAT_CHANNELS[GL_DEPTH_COMPONENT] = 1
FORMAT_CHANNELS[GL_DEPTH_STENCIL] =
FORMAT_CHANNELS[GL_LUMINANCE_ALPHA] = 2
FORMAT_CHANNELS[GL_RGB] =
FORMAT_CHANNELS[GL_SRGB_EXT] = 3
FORMAT_CHANNELS[GL_RGBA] =
FORMAT_CHANNELS[GL_SRGB_ALPHA_EXT] = 4

var formatTypes = {}
formatTypes[GL_RGBA4] = GL_UNSIGNED_SHORT_4_4_4_4
formatTypes[GL_RGB565] = GL_UNSIGNED_SHORT_5_6_5
formatTypes[GL_RGB5_A1] = GL_UNSIGNED_SHORT_5_5_5_1
formatTypes[GL_DEPTH_COMPONENT] = GL_UNSIGNED_INT
formatTypes[GL_DEPTH_STENCIL] = GL_UNSIGNED_INT_24_8_WEBGL

function objectName (str) {
  return '[object ' + str + ']'
}

var CANVAS_CLASS = objectName('HTMLCanvasElement')
var CONTEXT2D_CLASS = objectName('CanvasRenderingContext2D')
var IMAGE_CLASS = objectName('HTMLImageElement')
var VIDEO_CLASS = objectName('HTMLVideoElement')

var PIXEL_CLASSES = Object.keys(dtypes).concat([
  CANVAS_CLASS,
  CONTEXT2D_CLASS,
  IMAGE_CLASS,
  VIDEO_CLASS
])

// for every texture type, store
// the size in bytes.
var TYPE_SIZES = []
TYPE_SIZES[GL_UNSIGNED_BYTE] = 1
TYPE_SIZES[GL_FLOAT] = 4
TYPE_SIZES[GL_HALF_FLOAT_OES] = 2

TYPE_SIZES[GL_UNSIGNED_SHORT] = 2
TYPE_SIZES[GL_UNSIGNED_INT] = 4

var FORMAT_SIZES_SPECIAL = []
FORMAT_SIZES_SPECIAL[GL_RGBA4] = 2
FORMAT_SIZES_SPECIAL[GL_RGB5_A1] = 2
FORMAT_SIZES_SPECIAL[GL_RGB565] = 2
FORMAT_SIZES_SPECIAL[GL_DEPTH_STENCIL] = 4

FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_S3TC_DXT1_EXT] = 0.5
FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_S3TC_DXT1_EXT] = 0.5
FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_S3TC_DXT3_EXT] = 1
FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_S3TC_DXT5_EXT] = 1

FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_ATC_WEBGL] = 0.5
FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL] = 1
FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL] = 1

FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG] = 0.5
FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG] = 0.25
FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG] = 0.5
FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG] = 0.25

FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_ETC1_WEBGL] = 0.5

function isNumericArray (arr) {
  return (
    Array.isArray(arr) &&
    (arr.length === 0 ||
    typeof arr[0] === 'number'))
}

function isRectArray (arr) {
  if (!Array.isArray(arr)) {
    return false
  }
  var width = arr.length
  if (width === 0 || !isArrayLike(arr[0])) {
    return false
  }
  return true
}

function classString (x) {
  return Object.prototype.toString.call(x)
}

function isCanvasElement (object) {
  return classString(object) === CANVAS_CLASS
}

function isContext2D (object) {
  return classString(object) === CONTEXT2D_CLASS
}

function isImageElement (object) {
  return classString(object) === IMAGE_CLASS
}

function isVideoElement (object) {
  return classString(object) === VIDEO_CLASS
}

function isPixelData (object) {
  if (!object) {
    return false
  }
  var className = classString(object)
  if (PIXEL_CLASSES.indexOf(className) >= 0) {
    return true
  }
  return (
    isNumericArray(object) ||
    isRectArray(object) ||
    isNDArrayLike(object))
}

function typedArrayCode (data) {
  return arrayTypes[Object.prototype.toString.call(data)] | 0
}

function convertData (result, data) {
  var n = result.width * result.height * result.channels
  

  switch (result.type) {
    case GL_UNSIGNED_BYTE:
    case GL_UNSIGNED_SHORT:
    case GL_UNSIGNED_INT:
    case GL_FLOAT:
      var converted = pool.allocType(result.type, n)
      converted.set(data)
      result.data = converted
      break

    case GL_HALF_FLOAT_OES:
      result.data = convertToHalfFloat(data)
      break

    default:
      
  }
}

function preConvert (image, n) {
  return pool.allocType(
    image.type === GL_HALF_FLOAT_OES
      ? GL_FLOAT
      : image.type, n)
}

function postConvert (image, data) {
  if (image.type === GL_HALF_FLOAT_OES) {
    image.data = convertToHalfFloat(data)
    pool.freeType(data)
  } else {
    image.data = data
  }
}

function transposeData (image, array, strideX, strideY, strideC, offset) {
  var w = image.width
  var h = image.height
  var c = image.channels
  var n = w * h * c
  var data = preConvert(image, n)

  var p = 0
  for (var i = 0; i < h; ++i) {
    for (var j = 0; j < w; ++j) {
      for (var k = 0; k < c; ++k) {
        data[p++] = array[strideX * j + strideY * i + strideC * k + offset]
      }
    }
  }

  postConvert(image, data)
}

function flatten2DData (image, array, w, h) {
  var n = w * h
  var data = preConvert(image, n)

  var p = 0
  for (var i = 0; i < h; ++i) {
    var row = array[i]
    for (var j = 0; j < w; ++j) {
      data[p++] = row[j]
    }
  }

  postConvert(image, data)
}

function flatten3DData (image, array, w, h, c) {
  var n = w * h * c
  var data = preConvert(image, n)

  var p = 0
  for (var i = 0; i < h; ++i) {
    var row = array[i]
    for (var j = 0; j < w; ++j) {
      var pixel = row[j]
      for (var k = 0; k < c; ++k) {
        data[p++] = pixel[k]
      }
    }
  }

  postConvert(image, data)
}

function getTextureSize (format, type, width, height, isMipmap, isCube) {
  var s
  if (typeof FORMAT_SIZES_SPECIAL[format] !== 'undefined') {
    // we have a special array for dealing with weird color formats such as RGB5A1
    s = FORMAT_SIZES_SPECIAL[format]
  } else {
    s = FORMAT_CHANNELS[format] * TYPE_SIZES[type]
  }

  if (isCube) {
    s *= 6
  }

  if (isMipmap) {
    // compute the total size of all the mipmaps.
    var total = 0

    var w = width
    while (w >= 1) {
      // we can only use mipmaps on a square image,
      // so we can simply use the width and ignore the height:
      total += s * w * w
      w /= 2
    }
    return total
  } else {
    return s * width * height
  }
}

module.exports = function createTextureSet (
  gl, extensions, limits, reglPoll, contextState, stats, config) {
  // -------------------------------------------------------
  // Initialize constants and parameter tables here
  // -------------------------------------------------------
  var mipmapHint = {
    "don't care": GL_DONT_CARE,
    'dont care': GL_DONT_CARE,
    'nice': GL_NICEST,
    'fast': GL_FASTEST
  }

  var wrapModes = {
    'repeat': GL_REPEAT,
    'clamp': GL_CLAMP_TO_EDGE,
    'mirror': GL_MIRRORED_REPEAT
  }

  var magFilters = {
    'nearest': GL_NEAREST,
    'linear': GL_LINEAR
  }

  var minFilters = extend({
    'nearest mipmap nearest': GL_NEAREST_MIPMAP_NEAREST,
    'linear mipmap nearest': GL_LINEAR_MIPMAP_NEAREST,
    'nearest mipmap linear': GL_NEAREST_MIPMAP_LINEAR,
    'linear mipmap linear': GL_LINEAR_MIPMAP_LINEAR,
    'mipmap': GL_LINEAR_MIPMAP_LINEAR
  }, magFilters)

  var colorSpace = {
    'none': 0,
    'browser': GL_BROWSER_DEFAULT_WEBGL
  }

  var textureTypes = {
    'uint8': GL_UNSIGNED_BYTE,
    'rgba4': GL_UNSIGNED_SHORT_4_4_4_4,
    'rgb565': GL_UNSIGNED_SHORT_5_6_5,
    'rgb5 a1': GL_UNSIGNED_SHORT_5_5_5_1
  }

  var textureFormats = {
    'alpha': GL_ALPHA,
    'luminance': GL_LUMINANCE,
    'luminance alpha': GL_LUMINANCE_ALPHA,
    'rgb': GL_RGB,
    'rgba': GL_RGBA,
    'rgba4': GL_RGBA4,
    'rgb5 a1': GL_RGB5_A1,
    'rgb565': GL_RGB565
  }

  var compressedTextureFormats = {}

  if (extensions.ext_srgb) {
    textureFormats.srgb = GL_SRGB_EXT
    textureFormats.srgba = GL_SRGB_ALPHA_EXT
  }

  if (extensions.oes_texture_float) {
    textureTypes.float32 = textureTypes.float = GL_FLOAT
  }

  if (extensions.oes_texture_half_float) {
    textureTypes['float16'] = textureTypes['half float'] = GL_HALF_FLOAT_OES
  }

  if (extensions.webgl_depth_texture) {
    extend(textureFormats, {
      'depth': GL_DEPTH_COMPONENT,
      'depth stencil': GL_DEPTH_STENCIL
    })

    extend(textureTypes, {
      'uint16': GL_UNSIGNED_SHORT,
      'uint32': GL_UNSIGNED_INT,
      'depth stencil': GL_UNSIGNED_INT_24_8_WEBGL
    })
  }

  if (extensions.webgl_compressed_texture_s3tc) {
    extend(compressedTextureFormats, {
      'rgb s3tc dxt1': GL_COMPRESSED_RGB_S3TC_DXT1_EXT,
      'rgba s3tc dxt1': GL_COMPRESSED_RGBA_S3TC_DXT1_EXT,
      'rgba s3tc dxt3': GL_COMPRESSED_RGBA_S3TC_DXT3_EXT,
      'rgba s3tc dxt5': GL_COMPRESSED_RGBA_S3TC_DXT5_EXT
    })
  }

  if (extensions.webgl_compressed_texture_atc) {
    extend(compressedTextureFormats, {
      'rgb atc': GL_COMPRESSED_RGB_ATC_WEBGL,
      'rgba atc explicit alpha': GL_COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL,
      'rgba atc interpolated alpha': GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL
    })
  }

  if (extensions.webgl_compressed_texture_pvrtc) {
    extend(compressedTextureFormats, {
      'rgb pvrtc 4bppv1': GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
      'rgb pvrtc 2bppv1': GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG,
      'rgba pvrtc 4bppv1': GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
      'rgba pvrtc 2bppv1': GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
    })
  }

  if (extensions.webgl_compressed_texture_etc1) {
    compressedTextureFormats['rgb etc1'] = GL_COMPRESSED_RGB_ETC1_WEBGL
  }

  // Copy over all texture formats
  var supportedCompressedFormats = Array.prototype.slice.call(
    gl.getParameter(GL_COMPRESSED_TEXTURE_FORMATS))
  Object.keys(compressedTextureFormats).forEach(function (name) {
    var format = compressedTextureFormats[name]
    if (supportedCompressedFormats.indexOf(format) >= 0) {
      textureFormats[name] = format
    }
  })

  var supportedFormats = Object.keys(textureFormats)
  limits.textureFormats = supportedFormats

  // colorFormats[] gives the format (channels) associated to an
  // internalformat
  var colorFormats = supportedFormats.reduce(function (color, key) {
    var glenum = textureFormats[key]
    if (glenum === GL_LUMINANCE ||
        glenum === GL_ALPHA ||
        glenum === GL_LUMINANCE ||
        glenum === GL_LUMINANCE_ALPHA ||
        glenum === GL_DEPTH_COMPONENT ||
        glenum === GL_DEPTH_STENCIL) {
      color[glenum] = glenum
    } else if (glenum === GL_RGB5_A1 || key.indexOf('rgba') >= 0) {
      color[glenum] = GL_RGBA
    } else {
      color[glenum] = GL_RGB
    }
    return color
  }, {})

  function TexFlags () {
    // format info
    this.internalformat = GL_RGBA
    this.format = GL_RGBA
    this.type = GL_UNSIGNED_BYTE
    this.compressed = false

    // pixel storage
    this.premultiplyAlpha = false
    this.flipY = false
    this.unpackAlignment = 1
    this.colorSpace = 0

    // shape info
    this.width = 0
    this.height = 0
    this.channels = 4
  }

  function copyFlags (result, other) {
    result.internalformat = other.internalformat
    result.format = other.format
    result.type = other.type
    result.compressed = other.compressed

    result.premultiplyAlpha = other.premultiplyAlpha
    result.flipY = other.flipY
    result.unpackAlignment = other.unpackAlignment
    result.colorSpace = other.colorSpace

    result.width = other.width
    result.height = other.height
    result.channels = other.channels
  }

  function parseFlags (flags, options) {
    if (typeof options !== 'object' || !options) {
      return
    }

    if ('premultiplyAlpha' in options) {
      
      flags.premultiplyAlpha = options.premultiplyAlpha
    }

    if ('flipY' in options) {
      
      flags.flipY = options.flipY
    }

    if ('alignment' in options) {
      
      flags.unpackAlignment = options.alignment
    }

    if ('colorSpace' in options) {
      
      flags.colorSpace = colorSpace[options.colorSpace]
    }

    if ('type' in options) {
      var type = options.type
      
      
      
      
      flags.type = textureTypes[type]
    }

    var w = flags.width
    var h = flags.height
    var c = flags.channels
    var hasChannels = false
    if ('shape' in options) {
      
      w = options.shape[0]
      h = options.shape[1]
      if (options.shape.length === 3) {
        c = options.shape[2]
        
        hasChannels = true
      }
      
      
    } else {
      if ('radius' in options) {
        w = h = options.radius
        
      }
      if ('width' in options) {
        w = options.width
        
      }
      if ('height' in options) {
        h = options.height
        
      }
      if ('channels' in options) {
        c = options.channels
        
        hasChannels = true
      }
    }
    flags.width = w | 0
    flags.height = h | 0
    flags.channels = c | 0

    var hasFormat = false
    if ('format' in options) {
      var formatStr = options.format
      
      
      var internalformat = flags.internalformat = textureFormats[formatStr]
      flags.format = colorFormats[internalformat]
      if (formatStr in textureTypes) {
        if (!('type' in options)) {
          flags.type = textureTypes[formatStr]
        }
      }
      if (formatStr in compressedTextureFormats) {
        flags.compressed = true
      }
      hasFormat = true
    }

    // Reconcile channels and format
    if (!hasChannels && hasFormat) {
      flags.channels = FORMAT_CHANNELS[flags.format]
    } else if (hasChannels && !hasFormat) {
      if (flags.channels !== CHANNELS_FORMAT[flags.format]) {
        flags.format = flags.internalformat = CHANNELS_FORMAT[flags.channels]
      }
    } else if (hasFormat && hasChannels) {
      
    }
  }

  function setFlags (flags) {
    gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, flags.flipY)
    gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, flags.premultiplyAlpha)
    gl.pixelStorei(GL_UNPACK_COLORSPACE_CONVERSION_WEBGL, flags.colorSpace)
    gl.pixelStorei(GL_UNPACK_ALIGNMENT, flags.unpackAlignment)
  }

  // -------------------------------------------------------
  // Tex image data
  // -------------------------------------------------------
  function TexImage () {
    TexFlags.call(this)

    this.xOffset = 0
    this.yOffset = 0

    // data
    this.data = null
    this.needsFree = false

    // html element
    this.element = null

    // copyTexImage info
    this.needsCopy = false
  }

  function parseImage (image, options) {
    var data = null
    if (isPixelData(options)) {
      data = options
    } else if (options) {
      
      parseFlags(image, options)
      if ('x' in options) {
        image.xOffset = options.x | 0
      }
      if ('y' in options) {
        image.yOffset = options.y | 0
      }
      if (isPixelData(options.data)) {
        data = options.data
      }
    }

    

    if (options.copy) {
      
      var viewW = contextState.viewportWidth
      var viewH = contextState.viewportHeight
      image.width = image.width || (viewW - image.xOffset)
      image.height = image.height || (viewH - image.yOffset)
      image.needsCopy = true
      
    } else if (!data) {
      image.width = image.width || 1
      image.height = image.height || 1
    } else if (isTypedArray(data)) {
      image.data = data
      if (!('type' in options) && image.type === GL_UNSIGNED_BYTE) {
        image.type = typedArrayCode(data)
      }
    } else if (isNumericArray(data)) {
      convertData(image, data)
      image.alignment = 1
      image.needsFree = true
    } else if (isNDArrayLike(data)) {
      var array = data.data
      if (!Array.isArray(array) && image.type === GL_UNSIGNED_BYTE) {
        image.type = typedArrayCode(array)
      }
      var shape = data.shape
      var stride = data.stride
      var shapeX, shapeY, shapeC, strideX, strideY, strideC
      if (shape.length === 3) {
        shapeC = shape[2]
        strideC = stride[2]
      } else {
        
        shapeC = 1
        strideC = 1
      }
      shapeX = shape[0]
      shapeY = shape[1]
      strideX = stride[0]
      strideY = stride[1]
      image.alignment = 1
      image.width = shapeX
      image.height = shapeY
      image.channels = shapeC
      image.format = image.internalformat = CHANNELS_FORMAT[shapeC]
      image.needsFree = true
      transposeData(image, array, strideX, strideY, strideC, data.offset)
    } else if (isCanvasElement(data) || isContext2D(data)) {
      if (isCanvasElement(data)) {
        image.element = data
      } else {
        image.element = data.canvas
      }
      image.width = image.element.width
      image.height = image.element.height
    } else if (isImageElement(data)) {
      image.element = data
      image.width = data.naturalWidth
      image.height = data.naturalHeight
    } else if (isVideoElement(data)) {
      image.element = data
      image.width = data.videoWidth
      image.height = data.videoHeight
      image.needsPoll = true
    } else if (isRectArray(data)) {
      var w = data[0].length
      var h = data.length
      var c = 1
      if (isArrayLike(data[0][0])) {
        c = data[0][0].length
        flatten3DData(image, data, w, h, c)
      } else {
        flatten2DData(image, data, w, h)
      }
      image.alignment = 1
      image.width = w
      image.height = h
      image.channels = c
      image.format = image.internalformat = CHANNELS_FORMAT[c]
      image.needsFree = true
    }

    if (image.type === GL_FLOAT) {
      
    } else if (image.type === GL_HALF_FLOAT_OES) {
      
    }

    // do compressed texture  validation here.
  }

  function setImage (info, target, miplevel) {
    var element = info.element
    var data = info.data
    var internalformat = info.internalformat
    var format = info.format
    var type = info.type
    var width = info.width
    var height = info.height

    setFlags(info)

    if (element) {
      gl.texImage2D(target, miplevel, format, format, type, element)
    } else if (info.compressed) {
      gl.compressedTexImage2D(target, miplevel, internalformat, width, height, 0, data)
    } else if (info.needsCopy) {
      reglPoll()
      gl.copyTexImage2D(
        target, miplevel, format, info.xOffset, info.yOffset, width, height, 0)
    } else {
      gl.texImage2D(
        target, miplevel, format, width, height, 0, format, type, data)
    }
  }

  function setSubImage (info, target, x, y, miplevel) {
    var element = info.element
    var data = info.data
    var internalformat = info.internalformat
    var format = info.format
    var type = info.type
    var width = info.width
    var height = info.height

    setFlags(info)

    if (element) {
      gl.texSubImage2D(
        target, miplevel, x, y, format, type, element)
    } else if (info.compressed) {
      gl.compressedTexSubImage2D(
        target, miplevel, x, y, internalformat, width, height, data)
    } else if (info.needsCopy) {
      reglPoll()
      gl.copyTexSubImage2D(
        target, miplevel, x, y, info.xOffset, info.yOffset, width, height)
    } else {
      gl.texSubImage2D(
        target, miplevel, x, y, width, height, format, type, data)
    }
  }

  // texImage pool
  var imagePool = []

  function allocImage () {
    return imagePool.pop() || new TexImage()
  }

  function freeImage (image) {
    if (image.needsFree) {
      pool.freeType(image.data)
    }
    TexImage.call(image)
    imagePool.push(image)
  }

  // -------------------------------------------------------
  // Mip map
  // -------------------------------------------------------
  function MipMap () {
    TexFlags.call(this)

    this.genMipmaps = false
    this.mipmapHint = GL_DONT_CARE
    this.mipmask = 0
    this.images = Array(16)
  }

  function parseMipMapFromShape (mipmap, width, height) {
    var img = mipmap.images[0] = allocImage()
    mipmap.mipmask = 1
    img.width = mipmap.width = width
    img.height = mipmap.height = height
  }

  function parseMipMapFromObject (mipmap, options) {
    var imgData = null
    if (isPixelData(options)) {
      imgData = mipmap.images[0] = allocImage()
      copyFlags(imgData, mipmap)
      parseImage(imgData, options)
      mipmap.mipmask = 1
    } else {
      parseFlags(mipmap, options)
      if (Array.isArray(options.mipmap)) {
        var mipData = options.mipmap
        for (var i = 0; i < mipData.length; ++i) {
          imgData = mipmap.images[i] = allocImage()
          copyFlags(imgData, mipmap)
          imgData.width >>= i
          imgData.height >>= i
          parseImage(imgData, mipData[i])
          mipmap.mipmask |= (1 << i)
        }
      } else {
        imgData = mipmap.images[0] = allocImage()
        copyFlags(imgData, mipmap)
        parseImage(imgData, options)
        mipmap.mipmask = 1
      }
    }
    copyFlags(mipmap, mipmap.images[0])

    // For textures of the compressed format WEBGL_compressed_texture_s3tc
    // we must have that
    //
    // "When level equals zero width and height must be a multiple of 4.
    // When level is greater than 0 width and height must be 0, 1, 2 or a multiple of 4. "
    //
    // but we do not yet support having multiple mipmap levels for compressed textures,
    // so we only test for level zero.

    if (mipmap.compressed &&
        (mipmap.internalformat === GL_COMPRESSED_RGB_S3TC_DXT1_EXT) ||
        (mipmap.internalformat === GL_COMPRESSED_RGBA_S3TC_DXT1_EXT) ||
        (mipmap.internalformat === GL_COMPRESSED_RGBA_S3TC_DXT3_EXT) ||
        (mipmap.internalformat === GL_COMPRESSED_RGBA_S3TC_DXT5_EXT)) {
      
    }
  }

  function setMipMap (mipmap, target) {
    var images = mipmap.images
    for (var i = 0; i < images.length; ++i) {
      if (!images[i]) {
        return
      }
      setImage(images[i], target, i)
    }
  }

  var mipPool = []

  function allocMipMap () {
    var result = mipPool.pop() || new MipMap()
    TexFlags.call(result)
    result.mipmask = 0
    for (var i = 0; i < 16; ++i) {
      result.images[i] = null
    }
    return result
  }

  function freeMipMap (mipmap) {
    var images = mipmap.images
    for (var i = 0; i < images.length; ++i) {
      if (images[i]) {
        freeImage(images[i])
      }
      images[i] = null
    }
    mipPool.push(mipmap)
  }

  // -------------------------------------------------------
  // Tex info
  // -------------------------------------------------------
  function TexInfo () {
    this.minFilter = GL_NEAREST
    this.magFilter = GL_NEAREST

    this.wrapS = GL_CLAMP_TO_EDGE
    this.wrapT = GL_CLAMP_TO_EDGE

    this.anisotropic = 1

    this.genMipmaps = false
    this.mipmapHint = GL_DONT_CARE
  }

  function parseTexInfo (info, options) {
    if ('min' in options) {
      var minFilter = options.min
      
      info.minFilter = minFilters[minFilter]
      if (MIPMAP_FILTERS.indexOf(info.minFilter) >= 0) {
        info.genMipmaps = true
      }
    }

    if ('mag' in options) {
      var magFilter = options.mag
      
      info.magFilter = magFilters[magFilter]
    }

    var wrapS = info.wrapS
    var wrapT = info.wrapT
    if ('wrap' in options) {
      var wrap = options.wrap
      if (typeof wrap === 'string') {
        
        wrapS = wrapT = wrapModes[wrap]
      } else if (Array.isArray(wrap)) {
        
        
        wrapS = wrapModes[wrap[0]]
        wrapT = wrapModes[wrap[1]]
      }
    } else {
      if ('wrapS' in options) {
        var optWrapS = options.wrapS
        
        wrapS = wrapModes[optWrapS]
      }
      if ('wrapT' in options) {
        var optWrapT = options.wrapT
        
        wrapT = wrapModes[optWrapT]
      }
    }
    info.wrapS = wrapS
    info.wrapT = wrapT

    if ('anisotropic' in options) {
      var anisotropic = options.anisotropic
      
      info.anisotropic = options.anisotropic
    }

    if ('mipmap' in options) {
      var hasMipMap = false
      switch (typeof options.mipmap) {
        case 'string':
          
          info.mipmapHint = mipmapHint[options.mipmap]
          info.genMipmaps = true
          hasMipMap = true
          break

        case 'boolean':
          hasMipMap = info.genMipmaps = options.mipmap
          break

        case 'object':
          
          info.genMipmaps = false
          hasMipMap = true
          break

        default:
          
      }
      if (hasMipMap && !('min' in options)) {
        info.minFilter = GL_NEAREST_MIPMAP_NEAREST
      }
    }
  }

  function setTexInfo (info, target) {
    gl.texParameteri(target, GL_TEXTURE_MIN_FILTER, info.minFilter)
    gl.texParameteri(target, GL_TEXTURE_MAG_FILTER, info.magFilter)
    gl.texParameteri(target, GL_TEXTURE_WRAP_S, info.wrapS)
    gl.texParameteri(target, GL_TEXTURE_WRAP_T, info.wrapT)
    if (extensions.ext_texture_filter_anisotropic) {
      gl.texParameteri(target, GL_TEXTURE_MAX_ANISOTROPY_EXT, info.anisotropic)
    }
    if (info.genMipmaps) {
      gl.hint(GL_GENERATE_MIPMAP_HINT, info.mipmapHint)
      gl.generateMipmap(target)
    }
  }

  // -------------------------------------------------------
  // Full texture object
  // -------------------------------------------------------
  var textureCount = 0
  var textureSet = {}
  var numTexUnits = limits.maxTextureUnits
  var textureUnits = Array(numTexUnits).map(function () {
    return null
  })

  function REGLTexture (target) {
    TexFlags.call(this)
    this.mipmask = 0
    this.internalformat = GL_RGBA

    this.id = textureCount++

    this.refCount = 1

    this.target = target
    this.texture = gl.createTexture()

    this.unit = -1
    this.bindCount = 0

    this.texInfo = new TexInfo()

    if (config.profile) {
      this.stats = {size: 0}
    }
  }

  function tempBind (texture) {
    gl.activeTexture(GL_TEXTURE0)
    gl.bindTexture(texture.target, texture.texture)
  }

  function tempRestore () {
    var prev = textureUnits[0]
    if (prev) {
      gl.bindTexture(prev.target, prev.texture)
    } else {
      gl.bindTexture(GL_TEXTURE_2D, null)
    }
  }

  function destroy (texture) {
    var handle = texture.texture
    
    var unit = texture.unit
    var target = texture.target
    if (unit >= 0) {
      gl.activeTexture(GL_TEXTURE0 + unit)
      gl.bindTexture(target, null)
      textureUnits[unit] = null
    }
    gl.deleteTexture(handle)
    texture.texture = null
    texture.params = null
    texture.pixels = null
    texture.refCount = 0
    delete textureSet[texture.id]
    stats.textureCount--
  }

  extend(REGLTexture.prototype, {
    bind: function () {
      var texture = this
      texture.bindCount += 1
      var unit = texture.unit
      if (unit < 0) {
        for (var i = 0; i < numTexUnits; ++i) {
          var other = textureUnits[i]
          if (other) {
            if (other.bindCount > 0) {
              continue
            }
            other.unit = -1
          }
          textureUnits[i] = texture
          unit = i
          break
        }
        if (unit >= numTexUnits) {
          
        }
        if (config.profile && stats.maxTextureUnits < (unit + 1)) {
          stats.maxTextureUnits = unit + 1 // +1, since the units are zero-based
        }
        texture.unit = unit
        gl.activeTexture(GL_TEXTURE0 + unit)
        gl.bindTexture(texture.target, texture.texture)
      }
      return unit
    },

    unbind: function () {
      this.bindCount -= 1
    },

    decRef: function () {
      if (--this.refCount <= 0) {
        destroy(this)
      }
    }
  })

  function createTexture2D (a, b) {
    var texture = new REGLTexture(GL_TEXTURE_2D)
    textureSet[texture.id] = texture
    stats.textureCount++

    function reglTexture2D (a, b) {
      var texInfo = texture.texInfo
      TexInfo.call(texInfo)
      var mipData = allocMipMap()

      if (typeof a === 'number') {
        if (typeof b === 'number') {
          parseMipMapFromShape(mipData, a | 0, b | 0)
        } else {
          parseMipMapFromShape(mipData, a | 0, a | 0)
        }
      } else if (a) {
        
        parseTexInfo(texInfo, a)
        parseMipMapFromObject(mipData, a)
      } else {
        // empty textures get assigned a default shape of 1x1
        parseMipMapFromShape(mipData, 1, 1)
      }

      if (texInfo.genMipmaps) {
        mipData.mipmask = (mipData.width << 1) - 1
      }
      texture.mipmask = mipData.mipmask

      copyFlags(texture, mipData)

      
      texture.internalformat = mipData.internalformat

      reglTexture2D.width = mipData.width
      reglTexture2D.height = mipData.height

      tempBind(texture)
      setMipMap(mipData, GL_TEXTURE_2D)
      setTexInfo(texInfo, GL_TEXTURE_2D)
      tempRestore()

      freeMipMap(mipData)

      if (config.profile) {
        texture.stats.size = getTextureSize(
          texture.internalformat,
          texture.type,
          mipData.width,
          mipData.height,
          texInfo.genMipmaps,
          false)
      }

      return reglTexture2D
    }

    function subimage (image, x_, y_, level_) {
      

      var x = x_ | 0
      var y = y_ | 0
      var level = level_ | 0

      var imageData = allocImage()
      copyFlags(imageData, texture)
      imageData.width >>= level
      imageData.height >>= level
      imageData.width -= x
      imageData.height -= y
      parseImage(imageData, image)

      
      
      
      

      tempBind(texture)
      setSubImage(imageData, GL_TEXTURE_2D, x, y, level)
      tempRestore()

      freeImage(imageData)

      return reglTexture2D
    }

    function resize (w_, h_) {
      var w = w_ | 0
      var h = (h_ | 0) || w
      if (w === texture.width && h === texture.height) {
        return reglTexture2D
      }

      reglTexture2D.width = texture.width = w
      reglTexture2D.height = texture.height = h

      tempBind(texture)
      for (var i = 0; texture.mipmask >> i; ++i) {
        gl.texImage2D(
          GL_TEXTURE_2D,
          i,
          texture.format,
          w >> i,
          h >> i,
          0,
          texture.format,
          texture.type,
          null)
      }
      tempRestore()

      // also, recompute the texture size.
      if (config.profile) {
        texture.stats.size = getTextureSize(
          texture.internalformat,
          texture.type,
          w,
          h,
          false,
          false)
      }

      return reglTexture2D
    }

    reglTexture2D(a, b)

    reglTexture2D.subimage = subimage
    reglTexture2D.resize = resize
    reglTexture2D._reglType = 'texture2d'
    reglTexture2D._texture = texture
    if (config.profile) {
      reglTexture2D.stats = texture.stats
    }
    reglTexture2D.destroy = function () {
      texture.decRef()
    }

    return reglTexture2D
  }

  function createTextureCube (a0, a1, a2, a3, a4, a5) {
    var texture = new REGLTexture(GL_TEXTURE_CUBE_MAP)
    textureSet[texture.id] = texture
    stats.cubeCount++

    var faces = new Array(6)

    function reglTextureCube (a0, a1, a2, a3, a4, a5) {
      var i
      var texInfo = texture.texInfo
      TexInfo.call(texInfo)
      for (i = 0; i < 6; ++i) {
        faces[i] = allocMipMap()
      }

      if (typeof a0 === 'number' || !a0) {
        var s = (a0 | 0) || 1
        for (i = 0; i < 6; ++i) {
          parseMipMapFromShape(faces[i], s, s)
        }
      } else if (typeof a0 === 'object') {
        if (a1) {
          parseMipMapFromObject(faces[0], a0)
          parseMipMapFromObject(faces[1], a1)
          parseMipMapFromObject(faces[2], a2)
          parseMipMapFromObject(faces[3], a3)
          parseMipMapFromObject(faces[4], a4)
          parseMipMapFromObject(faces[5], a5)
        } else {
          parseTexInfo(texInfo, a0)
          parseFlags(texture, a0)
          if ('faces' in a0) {
            var face_input = a0.faces
            
            for (i = 0; i < 6; ++i) {
              
              copyFlags(faces[i], texture)
              parseMipMapFromObject(faces[i], face_input[i])
            }
          } else {
            for (i = 0; i < 6; ++i) {
              parseMipMapFromObject(faces[i], a0)
            }
          }
        }
      } else {
        
      }

      copyFlags(texture, faces[0])
      if (texInfo.genMipmaps) {
        texture.mipmask = (faces[0].width << 1) - 1
      } else {
        texture.mipmask = faces[0].mipmask
      }

      
      texture.internalformat = faces[0].internalformat

      reglTextureCube.width = faces[0].width
      reglTextureCube.height = faces[0].height

      tempBind(texture)
      for (i = 0; i < 6; ++i) {
        setMipMap(faces[i], GL_TEXTURE_CUBE_MAP_POSITIVE_X + i)
      }
      setTexInfo(texInfo, GL_TEXTURE_CUBE_MAP)
      tempRestore()

      if (config.profile) {
        texture.stats.size = getTextureSize(
          texture.internalformat,
          texture.type,
          reglTextureCube.width,
          reglTextureCube.height,
          texInfo.genMipmaps,
          true)
      }

      for (i = 0; i < 6; ++i) {
        freeMipMap(faces[i])
      }

      return reglTextureCube
    }

    function subimage (face, image, x_, y_, level_) {
      
      

      var x = x_ | 0
      var y = y_ | 0
      var level = level_ | 0

      var imageData = allocImage()
      copyFlags(imageData, texture)
      imageData.width >>= level
      imageData.height >>= level
      imageData.width -= x
      imageData.height -= y
      parseImage(imageData, image)

      
      
      
      

      tempBind(texture)
      setSubImage(imageData, GL_TEXTURE_CUBE_MAP_POSITIVE_X + face, x, y, level)
      tempRestore()

      freeImage(imageData)

      return reglTextureCube
    }

    function resize (radius_) {
      var radius = radius_ | 0
      if (radius === texture.width) {
        return
      }

      reglTextureCube.width = texture.width = radius
      reglTextureCube.height = texture.height = radius

      tempBind(texture)
      for (var i = 0; i < 6; ++i) {
        for (var j = 0; texture.mipmask >> j; ++j) {
          gl.texImage2D(
            GL_TEXTURE_CUBE_MAP_POSITIVE_X + i,
            j,
            texture.format,
            radius >> j,
            radius >> j,
            0,
            texture.format,
            texture.type,
            null)
        }
      }
      tempRestore()

      if (config.profile) {
        texture.stats.size = getTextureSize(
          texture.internalformat,
          texture.type,
          reglTextureCube.width,
          reglTextureCube.height,
          false,
          true)
      }

      return reglTextureCube
    }

    reglTextureCube(a0, a1, a2, a3, a4, a5)

    reglTextureCube.subimage = subimage
    reglTextureCube.resize = resize
    reglTextureCube._reglType = 'textureCube'
    reglTextureCube._texture = texture
    if (config.profile) {
      reglTextureCube.stats = texture.stats
    }
    reglTextureCube.destroy = function () {
      texture.decRef()
    }

    return reglTextureCube
  }

  // Called when regl is destroyed
  function destroyTextures () {
    for (var i = 0; i < numTexUnits; ++i) {
      gl.activeTexture(GL_TEXTURE0 + i)
      gl.bindTexture(GL_TEXTURE_2D, null)
      textureUnits[i] = null
    }
    values(textureSet).forEach(destroy)

    stats.cubeCount = 0
    stats.textureCount = 0
  }

  if (config.profile) {
    stats.getTotalTextureSize = function () {
      var total = 0
      Object.keys(textureSet).forEach(function (key) {
        total += textureSet[key].stats.size
      })
      return total
    }
  }

  function restoreTextures () {
    values(textureSet).forEach(function (texture) {
      texture.texture = gl.createTexture()
      gl.bindTexture(texture.target, texture.texture)
      for (var i = 0; i < 32; ++i) {
        if ((texture.mipmask & (1 << i)) === 0) {
          continue
        }
        if (texture.target === GL_TEXTURE_2D) {
          gl.texImage2D(GL_TEXTURE_2D,
            i,
            texture.internalformat,
            texture.width >> i,
            texture.height >> i,
            0,
            texture.internalformat,
            texture.type,
            null)
        } else {
          for (var j = 0; j < 6; ++j) {
            gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + j,
              i,
              texture.internalformat,
              texture.width >> i,
              texture.height >> i,
              0,
              texture.internalformat,
              texture.type,
              null)
          }
        }
      }
      setTexInfo(texture.texInfo, texture.target)
    })
  }

  return {
    create2D: createTexture2D,
    createCube: createTextureCube,
    clear: destroyTextures,
    getTexture: function (wrapper) {
      return null
    },
    restore: restoreTextures
  }
}

},{"./constants/arraytypes.json":4,"./util/extend":23,"./util/is-array-like":24,"./util/is-ndarray":25,"./util/is-typed-array":26,"./util/pool":28,"./util/to-half-float":30,"./util/values":31}],20:[function(require,module,exports){
var GL_QUERY_RESULT_EXT = 0x8866
var GL_QUERY_RESULT_AVAILABLE_EXT = 0x8867
var GL_TIME_ELAPSED_EXT = 0x88BF

module.exports = function (gl, extensions) {
  var extTimer = extensions.ext_disjoint_timer_query

  if (!extTimer) {
    return null
  }

  // QUERY POOL BEGIN
  var queryPool = []
  function allocQuery () {
    return queryPool.pop() || extTimer.createQueryEXT()
  }
  function freeQuery (query) {
    queryPool.push(query)
  }
  // QUERY POOL END

  var pendingQueries = []
  function beginQuery (stats) {
    var query = allocQuery()
    extTimer.beginQueryEXT(GL_TIME_ELAPSED_EXT, query)
    pendingQueries.push(query)
    pushScopeStats(pendingQueries.length - 1, pendingQueries.length, stats)
  }

  function endQuery () {
    extTimer.endQueryEXT(GL_TIME_ELAPSED_EXT)
  }

  //
  // Pending stats pool.
  //
  function PendingStats () {
    this.startQueryIndex = -1
    this.endQueryIndex = -1
    this.sum = 0
    this.stats = null
  }
  var pendingStatsPool = []
  function allocPendingStats () {
    return pendingStatsPool.pop() || new PendingStats()
  }
  function freePendingStats (pendingStats) {
    pendingStatsPool.push(pendingStats)
  }
  // Pending stats pool end

  var pendingStats = []
  function pushScopeStats (start, end, stats) {
    var ps = allocPendingStats()
    ps.startQueryIndex = start
    ps.endQueryIndex = end
    ps.sum = 0
    ps.stats = stats
    pendingStats.push(ps)
  }

  // we should call this at the beginning of the frame,
  // in order to update gpuTime
  var timeSum = []
  var queryPtr = []
  function update () {
    var ptr, i

    var n = pendingQueries.length
    if (n === 0) {
      return
    }

    // Reserve space
    queryPtr.length = Math.max(queryPtr.length, n + 1)
    timeSum.length = Math.max(timeSum.length, n + 1)
    timeSum[0] = 0
    queryPtr[0] = 0

    // Update all pending timer queries
    var queryTime = 0
    ptr = 0
    for (i = 0; i < pendingQueries.length; ++i) {
      var query = pendingQueries[i]
      if (extTimer.getQueryObjectEXT(query, GL_QUERY_RESULT_AVAILABLE_EXT)) {
        queryTime += extTimer.getQueryObjectEXT(query, GL_QUERY_RESULT_EXT)
        freeQuery(query)
      } else {
        pendingQueries[ptr++] = query
      }
      timeSum[i + 1] = queryTime
      queryPtr[i + 1] = ptr
    }
    pendingQueries.length = ptr

    // Update all pending stat queries
    ptr = 0
    for (i = 0; i < pendingStats.length; ++i) {
      var stats = pendingStats[i]
      var start = stats.startQueryIndex
      var end = stats.endQueryIndex
      stats.sum += timeSum[end] - timeSum[start]
      var startPtr = queryPtr[start]
      var endPtr = queryPtr[end]
      if (endPtr === startPtr) {
        stats.stats.gpuTime += stats.sum / 1e6
        freePendingStats(stats)
      } else {
        stats.startQueryIndex = startPtr
        stats.endQueryIndex = endPtr
        pendingStats[ptr++] = stats
      }
    }
    pendingStats.length = ptr
  }

  return {
    beginQuery: beginQuery,
    endQuery: endQuery,
    pushScopeStats: pushScopeStats,
    update: update,
    getNumPendingQueries: function () {
      return pendingQueries.length
    },
    clear: function () {
      queryPool.push.apply(queryPool, pendingQueries)
      for (var i = 0; i < queryPool.length; i++) {
        extTimer.deleteQueryEXT(queryPool[i])
      }
      pendingQueries.length = 0
      queryPool.length = 0
    },
    restore: function () {
      pendingQueries.length = 0
      queryPool.length = 0
    }
  }
}

},{}],21:[function(require,module,exports){
/* globals performance */
module.exports =
  (typeof performance !== 'undefined' && performance.now)
  ? function () { return performance.now() }
  : function () { return +(new Date()) }

},{}],22:[function(require,module,exports){
var extend = require('./extend')

function slice (x) {
  return Array.prototype.slice.call(x)
}

function join (x) {
  return slice(x).join('')
}

module.exports = function createEnvironment () {
  // Unique variable id counter
  var varCounter = 0

  // Linked values are passed from this scope into the generated code block
  // Calling link() passes a value into the generated scope and returns
  // the variable name which it is bound to
  var linkedNames = []
  var linkedValues = []
  function link (value) {
    for (var i = 0; i < linkedValues.length; ++i) {
      if (linkedValues[i] === value) {
        return linkedNames[i]
      }
    }

    var name = 'g' + (varCounter++)
    linkedNames.push(name)
    linkedValues.push(value)
    return name
  }

  // create a code block
  function block () {
    var code = []
    function push () {
      code.push.apply(code, slice(arguments))
    }

    var vars = []
    function def () {
      var name = 'v' + (varCounter++)
      vars.push(name)

      if (arguments.length > 0) {
        code.push(name, '=')
        code.push.apply(code, slice(arguments))
        code.push(';')
      }

      return name
    }

    return extend(push, {
      def: def,
      toString: function () {
        return join([
          (vars.length > 0 ? 'var ' + vars + ';' : ''),
          join(code)
        ])
      }
    })
  }

  function scope () {
    var entry = block()
    var exit = block()

    var entryToString = entry.toString
    var exitToString = exit.toString

    function save (object, prop) {
      exit(object, prop, '=', entry.def(object, prop), ';')
    }

    return extend(function () {
      entry.apply(entry, slice(arguments))
    }, {
      def: entry.def,
      entry: entry,
      exit: exit,
      save: save,
      set: function (object, prop, value) {
        save(object, prop)
        entry(object, prop, '=', value, ';')
      },
      toString: function () {
        return entryToString() + exitToString()
      }
    })
  }

  function conditional () {
    var pred = join(arguments)
    var thenBlock = scope()
    var elseBlock = scope()

    var thenToString = thenBlock.toString
    var elseToString = elseBlock.toString

    return extend(thenBlock, {
      then: function () {
        thenBlock.apply(thenBlock, slice(arguments))
        return this
      },
      else: function () {
        elseBlock.apply(elseBlock, slice(arguments))
        return this
      },
      toString: function () {
        var elseClause = elseToString()
        if (elseClause) {
          elseClause = 'else{' + elseClause + '}'
        }
        return join([
          'if(', pred, '){',
          thenToString(),
          '}', elseClause
        ])
      }
    })
  }

  // procedure list
  var globalBlock = block()
  var procedures = {}
  function proc (name, count) {
    var args = []
    function arg () {
      var name = 'a' + args.length
      args.push(name)
      return name
    }

    count = count || 0
    for (var i = 0; i < count; ++i) {
      arg()
    }

    var body = scope()
    var bodyToString = body.toString

    var result = procedures[name] = extend(body, {
      arg: arg,
      toString: function () {
        return join([
          'function(', args.join(), '){',
          bodyToString(),
          '}'
        ])
      }
    })

    return result
  }

  function compile () {
    var code = ['"use strict";',
      globalBlock,
      'return {']
    Object.keys(procedures).forEach(function (name) {
      code.push('"', name, '":', procedures[name].toString(), ',')
    })
    code.push('}')
    var src = join(code)
      .replace(/;/g, ';\n')
      .replace(/}/g, '}\n')
      .replace(/{/g, '{\n')
    var proc = Function.apply(null, linkedNames.concat(src))
    return proc.apply(null, linkedValues)
  }

  return {
    global: globalBlock,
    link: link,
    block: block,
    proc: proc,
    scope: scope,
    cond: conditional,
    compile: compile
  }
}

},{"./extend":23}],23:[function(require,module,exports){
module.exports = function (base, opts) {
  var keys = Object.keys(opts)
  for (var i = 0; i < keys.length; ++i) {
    base[keys[i]] = opts[keys[i]]
  }
  return base
}

},{}],24:[function(require,module,exports){
var isTypedArray = require('./is-typed-array')
module.exports = function isArrayLike (s) {
  return Array.isArray(s) || isTypedArray(s)
}

},{"./is-typed-array":26}],25:[function(require,module,exports){
var isTypedArray = require('./is-typed-array')

module.exports = function isNDArrayLike (obj) {
  return (
    !!obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.shape) &&
    Array.isArray(obj.stride) &&
    typeof obj.offset === 'number' &&
    obj.shape.length === obj.stride.length &&
    (Array.isArray(obj.data) ||
      isTypedArray(obj.data)))
}

},{"./is-typed-array":26}],26:[function(require,module,exports){
var dtypes = require('../constants/arraytypes.json')
module.exports = function (x) {
  return Object.prototype.toString.call(x) in dtypes
}

},{"../constants/arraytypes.json":4}],27:[function(require,module,exports){
module.exports = function loop (n, f) {
  var result = Array(n)
  for (var i = 0; i < n; ++i) {
    result[i] = f(i)
  }
  return result
}

},{}],28:[function(require,module,exports){
var loop = require('./loop')

var GL_BYTE = 5120
var GL_UNSIGNED_BYTE = 5121
var GL_SHORT = 5122
var GL_UNSIGNED_SHORT = 5123
var GL_INT = 5124
var GL_UNSIGNED_INT = 5125
var GL_FLOAT = 5126

var bufferPool = loop(8, function () {
  return []
})

function nextPow16 (v) {
  for (var i = 16; i <= (1 << 28); i *= 16) {
    if (v <= i) {
      return i
    }
  }
  return 0
}

function log2 (v) {
  var r, shift
  r = (v > 0xFFFF) << 4
  v >>>= r
  shift = (v > 0xFF) << 3
  v >>>= shift; r |= shift
  shift = (v > 0xF) << 2
  v >>>= shift; r |= shift
  shift = (v > 0x3) << 1
  v >>>= shift; r |= shift
  return r | (v >> 1)
}

function alloc (n) {
  var sz = nextPow16(n)
  var bin = bufferPool[log2(sz) >> 2]
  if (bin.length > 0) {
    return bin.pop()
  }
  return new ArrayBuffer(sz)
}

function free (buf) {
  bufferPool[log2(buf.byteLength) >> 2].push(buf)
}

function allocType (type, n) {
  var result = null
  switch (type) {
    case GL_BYTE:
      result = new Int8Array(alloc(n), 0, n)
      break
    case GL_UNSIGNED_BYTE:
      result = new Uint8Array(alloc(n), 0, n)
      break
    case GL_SHORT:
      result = new Int16Array(alloc(2 * n), 0, n)
      break
    case GL_UNSIGNED_SHORT:
      result = new Uint16Array(alloc(2 * n), 0, n)
      break
    case GL_INT:
      result = new Int32Array(alloc(4 * n), 0, n)
      break
    case GL_UNSIGNED_INT:
      result = new Uint32Array(alloc(4 * n), 0, n)
      break
    case GL_FLOAT:
      result = new Float32Array(alloc(4 * n), 0, n)
      break
    default:
      return null
  }
  if (result.length !== n) {
    return result.subarray(0, n)
  }
  return result
}

function freeType (array) {
  free(array.buffer)
}

module.exports = {
  alloc: alloc,
  free: free,
  allocType: allocType,
  freeType: freeType
}

},{"./loop":27}],29:[function(require,module,exports){
/* globals requestAnimationFrame, cancelAnimationFrame */
if (typeof requestAnimationFrame === 'function' &&
    typeof cancelAnimationFrame === 'function') {
  module.exports = {
    next: function (x) { return requestAnimationFrame(x) },
    cancel: function (x) { return cancelAnimationFrame(x) }
  }
} else {
  module.exports = {
    next: function (cb) {
      return setTimeout(cb, 16)
    },
    cancel: clearTimeout
  }
}

},{}],30:[function(require,module,exports){
var pool = require('./pool')

var FLOAT = new Float32Array(1)
var INT = new Uint32Array(FLOAT.buffer)

var GL_UNSIGNED_SHORT = 5123

module.exports = function convertToHalfFloat (array) {
  var ushorts = pool.allocType(GL_UNSIGNED_SHORT, array.length)

  for (var i = 0; i < array.length; ++i) {
    if (isNaN(array[i])) {
      ushorts[i] = 0xffff
    } else if (array[i] === Infinity) {
      ushorts[i] = 0x7c00
    } else if (array[i] === -Infinity) {
      ushorts[i] = 0xfc00
    } else {
      FLOAT[0] = array[i]
      var x = INT[0]

      var sgn = (x >>> 31) << 15
      var exp = ((x << 1) >>> 24) - 127
      var frac = (x >> 13) & ((1 << 10) - 1)

      if (exp < -24) {
        // round non-representable denormals to 0
        ushorts[i] = sgn
      } else if (exp < -14) {
        // handle denormals
        var s = -14 - exp
        ushorts[i] = sgn + ((frac + (1 << 10)) >> s)
      } else if (exp > 15) {
        // round overflow to +/- Infinity
        ushorts[i] = sgn + 0x7c00
      } else {
        // otherwise convert directly
        ushorts[i] = sgn + ((exp + 15) << 10) + frac
      }
    }
  }

  return ushorts
}

},{"./pool":28}],31:[function(require,module,exports){
module.exports = function (obj) {
  return Object.keys(obj).map(function (key) { return obj[key] })
}

},{}],32:[function(require,module,exports){
// Context and canvas creation helper functions

var extend = require('./util/extend')

function createCanvas (element, onDone, pixelRatio) {
  var canvas = document.createElement('canvas')
  extend(canvas.style, {
    border: 0,
    margin: 0,
    padding: 0,
    top: 0,
    left: 0
  })
  element.appendChild(canvas)

  if (element === document.body) {
    canvas.style.position = 'absolute'
    extend(element.style, {
      margin: 0,
      padding: 0
    })
  }

  function resize () {
    var w = window.innerWidth
    var h = window.innerHeight
    if (element !== document.body) {
      var bounds = element.getBoundingClientRect()
      w = bounds.right - bounds.left
      h = bounds.top - bounds.bottom
    }
    canvas.width = pixelRatio * w
    canvas.height = pixelRatio * h
    extend(canvas.style, {
      width: w + 'px',
      height: h + 'px'
    })
  }

  window.addEventListener('resize', resize, false)

  function onDestroy () {
    window.removeEventListener('resize', resize)
    element.removeChild(canvas)
  }

  resize()

  return {
    canvas: canvas,
    onDestroy: onDestroy
  }
}

function createContext (canvas, contexAttributes) {
  function get (name) {
    try {
      return canvas.getContext(name, contexAttributes)
    } catch (e) {
      return null
    }
  }
  return (
    get('webgl') ||
    get('experimental-webgl') ||
    get('webgl-experimental')
  )
}

function isHTMLElement (obj) {
  return (
    typeof obj.nodeName === 'string' &&
    typeof obj.appendChild === 'function' &&
    typeof obj.getBoundingClientRect === 'function'
  )
}

function isWebGLContext (obj) {
  return (
    typeof obj.drawArrays === 'function' ||
    typeof obj.drawElements === 'function'
  )
}

function parseExtensions (input) {
  if (typeof input === 'string') {
    return input.split()
  }
  
  return input
}

function getElement (desc) {
  if (typeof desc === 'string') {
    
    return document.querySelector(desc)
  }
  return desc
}

module.exports = function parseArgs (args_) {
  var args = args_ || {}
  var element, container, canvas, gl
  var contextAttributes = {}
  var extensions = []
  var optionalExtensions = []
  var pixelRatio = (typeof window === 'undefined' ? 1 : window.devicePixelRatio)
  var profile = false
  var onDone = function (err) {
    if (err) {
      
    }
  }
  var onDestroy = function () {}
  if (typeof args === 'string') {
    
    element = document.querySelector(args)
    
  } else if (typeof args === 'object') {
    if (isHTMLElement(args)) {
      element = args
    } else if (isWebGLContext(args)) {
      gl = args
      canvas = gl.canvas
    } else {
      
      if ('gl' in args) {
        gl = args.gl
      } else if ('canvas' in args) {
        canvas = getElement(args.canvas)
      } else if ('container' in args) {
        container = getElement(args.container)
      }
      if ('attributes' in args) {
        contextAttributes = args.attributes
        
      }
      if ('extensions' in args) {
        extensions = parseExtensions(args.extensions)
      }
      if ('optionalExtensions' in args) {
        optionalExtensions = parseExtensions(args.optionalExtensions)
      }
      if ('onDone' in args) {
        
        onDone = args.onDone
      }
      if ('profile' in args) {
        profile = !!args.profile
      }
      if ('pixelRatio' in args) {
        pixelRatio = +args.pixelRatio
        
      }
    }
  } else {
    
  }

  if (element) {
    if (element.nodeName.toLowerCase() === 'canvas') {
      canvas = element
    } else {
      container = element
    }
  }

  if (!gl) {
    if (!canvas) {
      
      var result = createCanvas(container || document.body, onDone, pixelRatio)
      if (!result) {
        return null
      }
      canvas = result.canvas
      onDestroy = result.onDestroy
    }
    gl = createContext(canvas, contextAttributes)
  }

  if (!gl) {
    onDestroy()
    onDone('webgl not supported, try upgrading your browser or graphics drivers http://get.webgl.org')
    return null
  }

  return {
    gl: gl,
    canvas: canvas,
    container: container,
    extensions: extensions,
    optionalExtensions: optionalExtensions,
    pixelRatio: pixelRatio,
    profile: profile,
    onDone: onDone,
    onDestroy: onDestroy
  }
}

},{"./util/extend":23}],33:[function(require,module,exports){
module.exports = adjoint;

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function adjoint(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};
},{}],34:[function(require,module,exports){
module.exports = clone;

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
function clone(a) {
    var out = new Float32Array(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};
},{}],35:[function(require,module,exports){
module.exports = copy;

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};
},{}],36:[function(require,module,exports){
module.exports = create;

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
function create() {
    var out = new Float32Array(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
},{}],37:[function(require,module,exports){
module.exports = determinant;

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
function determinant(a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};
},{}],38:[function(require,module,exports){
module.exports = fromQuat;

/**
 * Creates a matrix from a quaternion rotation.
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @returns {mat4} out
 */
function fromQuat(out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};
},{}],39:[function(require,module,exports){
module.exports = fromRotationTranslation;

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
function fromRotationTranslation(out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};
},{}],40:[function(require,module,exports){
module.exports = frustum;

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
function frustum(out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};
},{}],41:[function(require,module,exports){
module.exports = identity;

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};
},{}],42:[function(require,module,exports){
module.exports = {
  create: require('./create')
  , clone: require('./clone')
  , copy: require('./copy')
  , identity: require('./identity')
  , transpose: require('./transpose')
  , invert: require('./invert')
  , adjoint: require('./adjoint')
  , determinant: require('./determinant')
  , multiply: require('./multiply')
  , translate: require('./translate')
  , scale: require('./scale')
  , rotate: require('./rotate')
  , rotateX: require('./rotateX')
  , rotateY: require('./rotateY')
  , rotateZ: require('./rotateZ')
  , fromRotationTranslation: require('./fromRotationTranslation')
  , fromQuat: require('./fromQuat')
  , frustum: require('./frustum')
  , perspective: require('./perspective')
  , perspectiveFromFieldOfView: require('./perspectiveFromFieldOfView')
  , ortho: require('./ortho')
  , lookAt: require('./lookAt')
  , str: require('./str')
}
},{"./adjoint":33,"./clone":34,"./copy":35,"./create":36,"./determinant":37,"./fromQuat":38,"./fromRotationTranslation":39,"./frustum":40,"./identity":41,"./invert":43,"./lookAt":44,"./multiply":45,"./ortho":46,"./perspective":47,"./perspectiveFromFieldOfView":48,"./rotate":49,"./rotateX":50,"./rotateY":51,"./rotateZ":52,"./scale":53,"./str":54,"./translate":55,"./transpose":56}],43:[function(require,module,exports){
module.exports = invert;

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function invert(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};
},{}],44:[function(require,module,exports){
var identity = require('./identity');

module.exports = lookAt;

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
function lookAt(out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < 0.000001 &&
        Math.abs(eyey - centery) < 0.000001 &&
        Math.abs(eyez - centerz) < 0.000001) {
        return identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};
},{"./identity":41}],45:[function(require,module,exports){
module.exports = multiply;

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function multiply(out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};
},{}],46:[function(require,module,exports){
module.exports = ortho;

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function ortho(out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};
},{}],47:[function(require,module,exports){
module.exports = perspective;

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};
},{}],48:[function(require,module,exports){
module.exports = perspectiveFromFieldOfView;

/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
function perspectiveFromFieldOfView(out, fov, near, far) {
    var upTan = Math.tan(fov.upDegrees * Math.PI/180.0),
        downTan = Math.tan(fov.downDegrees * Math.PI/180.0),
        leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0),
        rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0),
        xScale = 2.0 / (leftTan + rightTan),
        yScale = 2.0 / (upTan + downTan);

    out[0] = xScale;
    out[1] = 0.0;
    out[2] = 0.0;
    out[3] = 0.0;
    out[4] = 0.0;
    out[5] = yScale;
    out[6] = 0.0;
    out[7] = 0.0;
    out[8] = -((leftTan - rightTan) * xScale * 0.5);
    out[9] = ((upTan - downTan) * yScale * 0.5);
    out[10] = far / (near - far);
    out[11] = -1.0;
    out[12] = 0.0;
    out[13] = 0.0;
    out[14] = (far * near) / (near - far);
    out[15] = 0.0;
    return out;
}


},{}],49:[function(require,module,exports){
module.exports = rotate;

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
function rotate(out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < 0.000001) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};
},{}],50:[function(require,module,exports){
module.exports = rotateX;

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateX(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};
},{}],51:[function(require,module,exports){
module.exports = rotateY;

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateY(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};
},{}],52:[function(require,module,exports){
module.exports = rotateZ;

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
function rotateZ(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};
},{}],53:[function(require,module,exports){
module.exports = scale;

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
function scale(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};
},{}],54:[function(require,module,exports){
module.exports = str;

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
function str(a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};
},{}],55:[function(require,module,exports){
module.exports = translate;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
function translate(out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};
},{}],56:[function(require,module,exports){
module.exports = transpose;

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function transpose(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};
},{}],57:[function(require,module,exports){
/* global XMLHttpRequest */
var configParameters = [
  'manifest',
  'onDone',
  'onProgress',
  'onError'
]

var manifestParameters = [
  'type',
  'src',
  'stream',
  'credentials',
  'parser'
]

var parserParameters = [
  'onData',
  'onDone'
]

var STATE_ERROR = -1
var STATE_DATA = 0
var STATE_COMPLETE = 1

function raise (message) {
  throw new Error('resl: ' + message)
}

function checkType (object, parameters, name) {
  Object.keys(object).forEach(function (param) {
    if (parameters.indexOf(param) < 0) {
      raise('invalid parameter "' + param + '" in ' + name)
    }
  })
}

function Loader (name, cancel) {
  this.state = STATE_DATA
  this.ready = false
  this.progress = 0
  this.name = name
  this.cancel = cancel
}

module.exports = function resl (config) {
  if (typeof config !== 'object' || !config) {
    raise('invalid or missing configuration')
  }

  checkType(config, configParameters, 'config')

  var manifest = config.manifest
  if (typeof manifest !== 'object' || !manifest) {
    raise('missing manifest')
  }

  function getFunction (name, dflt) {
    if (name in config) {
      var func = config[name]
      if (typeof func !== 'function') {
        raise('invalid callback "' + name + '"')
      }
      return func
    }
    return null
  }

  var onDone = getFunction('onDone')
  if (!onDone) {
    raise('missing onDone() callback')
  }

  var onProgress = getFunction('onProgress')
  var onError = getFunction('onError')

  var assets = {}

  var state = STATE_DATA

  function loadXHR (request) {
    var name = request.name
    var stream = request.stream
    var binary = request.type === 'binary'
    var parser = request.parser

    var xhr = new XMLHttpRequest()
    var asset = null

    var loader = new Loader(name, cancel)

    if (stream) {
      xhr.onreadystatechange = onReadyStateChange
    } else {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          onReadyStateChange()
        }
      }
    }

    if (binary) {
      xhr.responseType = 'arraybuffer'
    }

    function onReadyStateChange () {
      if (xhr.readyState < 2 ||
          loader.state === STATE_COMPLETE ||
          loader.state === STATE_ERROR) {
        return
      }
      if (xhr.status !== 200) {
        return abort('error loading resource "' + request.name + '"')
      }
      if (xhr.readyState > 2 && loader.state === STATE_DATA) {
        var response
        if (request.type === 'binary') {
          response = xhr.response
        } else {
          response = xhr.responseText
        }
        if (parser.data) {
          try {
            asset = parser.data(response)
          } catch (e) {
            return abort(e)
          }
        } else {
          asset = response
        }
      }
      if (xhr.readyState > 3 && loader.state === STATE_DATA) {
        if (parser.done) {
          try {
            asset = parser.done()
          } catch (e) {
            return abort(e)
          }
        }
        loader.state = STATE_COMPLETE
      }
      assets[name] = asset
      loader.progress = 0.75 * loader.progress + 0.25
      loader.ready =
        (request.stream && !!asset) ||
        loader.state === STATE_COMPLETE
      notifyProgress()
    }

    function cancel () {
      if (loader.state === STATE_COMPLETE || loader.state === STATE_ERROR) {
        return
      }
      xhr.onreadystatechange = null
      xhr.abort()
      loader.state = STATE_ERROR
    }

    // set up request
    if (request.credentials) {
      xhr.withCredentials = true
    }
    xhr.open('GET', request.src, true)
    xhr.send()

    return loader
  }

  function loadElement (request, element) {
    var name = request.name
    var parser = request.parser

    var loader = new Loader(name, cancel)
    var asset = element

    function handleProgress () {
      if (loader.state === STATE_DATA) {
        if (parser.data) {
          try {
            asset = parser.data(element)
          } catch (e) {
            return abort(e)
          }
        } else {
          asset = element
        }
      }
    }

    function onProgress (e) {
      handleProgress()
      assets[name] = asset
      if (e.lengthComputable) {
        loader.progress = Math.max(loader.progress, e.loaded / e.total)
      } else {
        loader.progress = 0.75 * loader.progress + 0.25
      }
      loader.ready = request.stream
      notifyProgress(name)
    }

    function onComplete () {
      handleProgress()
      if (loader.state === STATE_DATA) {
        if (parser.done) {
          try {
            asset = parser.done()
          } catch (e) {
            return abort(e)
          }
        }
        loader.state = STATE_COMPLETE
      }
      loader.progress = 1
      loader.ready = true
      assets[name] = asset
      removeListeners()
      notifyProgress('finish ' + name)
    }

    function onError () {
      abort('error loading asset "' + name + '"')
    }

    if (request.stream) {
      element.addEventListener('progress', onProgress)
    }
    if (request.type === 'image') {
      element.addEventListener('load', onComplete)
    } else {
      element.addEventListener('canplay', onComplete)
    }
    element.addEventListener('error', onError)

    function removeListeners () {
      if (request.stream) {
        element.removeEventListener('progress', onProgress)
      }
      if (request.type === 'image') {
        element.addEventListener('load', onComplete)
      } else {
        element.addEventListener('canplay', onComplete)
      }
      element.removeEventListener('error', onError)
    }

    function cancel () {
      if (loader.state === STATE_COMPLETE || loader.state === STATE_ERROR) {
        return
      }
      loader.state = STATE_ERROR
      removeListeners()
      element.src = ''
    }

    // set up request
    if (request.credentials) {
      element.crossOrigin = 'use-credentials'
    } else {
      element.crossOrigin = 'anonymous'
    }
    element.src = request.src

    return loader
  }

  var loaders = {
    text: loadXHR,
    binary: function (request) {
      // TODO use fetch API for streaming if supported
      return loadXHR(request)
    },
    image: function (request) {
      return loadElement(request, document.createElement('img'))
    },
    video: function (request) {
      return loadElement(request, document.createElement('video'))
    },
    audio: function (request) {
      return loadElement(request, document.createElement('audio'))
    }
  }

  // First we parse all objects in order to verify that all type information
  // is correct
  var pending = Object.keys(manifest).map(function (name) {
    var request = manifest[name]
    if (typeof request === 'string') {
      request = {
        src: request
      }
    } else if (typeof request !== 'object' || !request) {
      raise('invalid asset definition "' + name + '"')
    }

    checkType(request, manifestParameters, 'asset "' + name + '"')

    function getParameter (prop, accepted, init) {
      var value = init
      if (prop in request) {
        value = request[prop]
      }
      if (accepted.indexOf(value) < 0) {
        raise('invalid ' + prop + ' "' + value + '" for asset "' + name + '", possible values: ' + accepted)
      }
      return value
    }

    function getString (prop, required, init) {
      var value = init
      if (prop in request) {
        value = request[prop]
      } else if (required) {
        raise('missing ' + prop + ' for asset "' + name + '"')
      }
      if (typeof value !== 'string') {
        raise('invalid ' + prop + ' for asset "' + name + '", must be a string')
      }
      return value
    }

    function getParseFunc (name, dflt) {
      if (name in request.parser) {
        var result = request.parser[name]
        if (typeof result !== 'function') {
          raise('invalid parser callback ' + name + ' for asset "' + name + '"')
        }
        return result
      } else {
        return dflt
      }
    }

    var parser = {}
    if ('parser' in request) {
      if (typeof request.parser === 'function') {
        parser = {
          data: request.parser
        }
      } else if (typeof request.parser === 'object' && request.parser) {
        checkType(parser, parserParameters, 'parser for asset "' + name + '"')
        if (!('onData' in parser)) {
          raise('missing onData callback for parser in asset "' + name + '"')
        }
        parser = {
          data: getParseFunc('onData'),
          done: getParseFunc('onDone')
        }
      } else {
        raise('invalid parser for asset "' + name + '"')
      }
    }

    return {
      name: name,
      type: getParameter('type', Object.keys(loaders), 'text'),
      stream: !!request.stream,
      credentials: !!request.credentials,
      src: getString('src', true, ''),
      parser: parser
    }
  }).map(function (request) {
    return (loaders[request.type])(request)
  })

  function abort (message) {
    if (state === STATE_ERROR || state === STATE_COMPLETE) {
      return
    }
    state = STATE_ERROR
    pending.forEach(function (loader) {
      loader.cancel()
    })
    if (onError) {
      if (typeof message === 'string') {
        onError(new Error('resl: ' + message))
      } else {
        onError(message)
      }
    } else {
      console.error('resl error:', message)
    }
  }

  function notifyProgress (message) {
    if (state === STATE_ERROR || state === STATE_COMPLETE) {
      return
    }

    var progress = 0
    var numReady = 0
    pending.forEach(function (loader) {
      if (loader.ready) {
        numReady += 1
      }
      progress += loader.progress
    })

    if (numReady === pending.length) {
      state = STATE_COMPLETE
      onDone(assets)
    } else {
      if (onProgress) {
        onProgress(progress / pending.length, message)
      }
    }
  }
}

},{}],58:[function(require,module,exports){

var extend = require('./lib/util/extend')
var dynamic = require('./lib/dynamic')
var raf = require('./lib/util/raf')
var clock = require('./lib/util/clock')
var createStringStore = require('./lib/strings')
var initWebGL = require('./lib/webgl')
var wrapExtensions = require('./lib/extension')
var wrapLimits = require('./lib/limits')
var wrapBuffers = require('./lib/buffer')
var wrapElements = require('./lib/elements')
var wrapTextures = require('./lib/texture')
var wrapRenderbuffers = require('./lib/renderbuffer')
var wrapFramebuffers = require('./lib/framebuffer')
var wrapAttributes = require('./lib/attribute')
var wrapShaders = require('./lib/shader')
var wrapRead = require('./lib/read')
var createCore = require('./lib/core')
var createStats = require('./lib/stats')
var createTimer = require('./lib/timer')

var GL_COLOR_BUFFER_BIT = 16384
var GL_DEPTH_BUFFER_BIT = 256
var GL_STENCIL_BUFFER_BIT = 1024

var GL_ARRAY_BUFFER = 34962

var CONTEXT_LOST_EVENT = 'webglcontextlost'
var CONTEXT_RESTORED_EVENT = 'webglcontextrestored'

var DYN_PROP = 1
var DYN_CONTEXT = 2
var DYN_STATE = 3

function find (haystack, needle) {
  for (var i = 0; i < haystack.length; ++i) {
    if (haystack[i] === needle) {
      return i
    }
  }
  return -1
}

module.exports = function wrapREGL (args) {
  var config = initWebGL(args)
  if (!config) {
    return null
  }

  var gl = config.gl
  var glAttributes = gl.getContextAttributes()
  var contextLost = gl.isContextLost()

  var extensionState = wrapExtensions(gl, config)
  if (!extensionState) {
    return null
  }

  var stringStore = createStringStore()
  var stats = createStats()
  var extensions = extensionState.extensions
  var timer = createTimer(gl, extensions)

  var START_TIME = clock()
  var WIDTH = gl.drawingBufferWidth
  var HEIGHT = gl.drawingBufferHeight

  var contextState = {
    tick: 0,
    time: 0,
    viewportWidth: WIDTH,
    viewportHeight: HEIGHT,
    framebufferWidth: WIDTH,
    framebufferHeight: HEIGHT,
    drawingBufferWidth: WIDTH,
    drawingBufferHeight: HEIGHT,
    pixelRatio: config.pixelRatio
  }
  var uniformState = {}
  var drawState = {
    elements: null,
    primitive: 4, // GL_TRIANGLES
    count: -1,
    offset: 0,
    instances: -1
  }

  var limits = wrapLimits(gl, extensions)
  var bufferState = wrapBuffers(gl, stats, config)
  var elementState = wrapElements(gl, extensions, bufferState, stats)
  var attributeState = wrapAttributes(
    gl,
    extensions,
    limits,
    bufferState,
    stringStore)
  var shaderState = wrapShaders(gl, stringStore, stats, config)
  var textureState = wrapTextures(
    gl,
    extensions,
    limits,
    function () { core.procs.poll() },
    contextState,
    stats,
    config)
  var renderbufferState = wrapRenderbuffers(gl, extensions, limits, stats, config)
  var framebufferState = wrapFramebuffers(
    gl,
    extensions,
    limits,
    textureState,
    renderbufferState,
    stats)
  var core = createCore(
    gl,
    stringStore,
    extensions,
    limits,
    bufferState,
    elementState,
    textureState,
    framebufferState,
    uniformState,
    attributeState,
    shaderState,
    drawState,
    contextState,
    timer,
    config)
  var readPixels = wrapRead(
    gl,
    framebufferState,
    core.procs.poll,
    contextState,
    glAttributes, extensions)

  var nextState = core.next
  var canvas = gl.canvas

  var rafCallbacks = []
  var lossCallbacks = []
  var restoreCallbacks = []
  var destroyCallbacks = [config.onDestroy]

  var activeRAF = null
  function handleRAF () {
    if (rafCallbacks.length === 0) {
      if (timer) {
        timer.update()
      }
      activeRAF = null
      return
    }

    // schedule next animation frame
    activeRAF = raf.next(handleRAF)

    // poll for changes
    poll()

    // fire a callback for all pending rafs
    for (var i = rafCallbacks.length - 1; i >= 0; --i) {
      var cb = rafCallbacks[i]
      if (cb) {
        cb(contextState, null, 0)
      }
    }

    // flush all pending webgl calls
    gl.flush()

    // poll GPU timers *after* gl.flush so we don't delay command dispatch
    if (timer) {
      timer.update()
    }
  }

  function startRAF () {
    if (!activeRAF && rafCallbacks.length > 0) {
      activeRAF = raf.next(handleRAF)
    }
  }

  function stopRAF () {
    if (activeRAF) {
      raf.cancel(handleRAF)
      activeRAF = null
    }
  }

  function handleContextLoss (event) {
    event.preventDefault()

    // set context lost flag
    contextLost = true

    // pause request animation frame
    stopRAF()

    // lose context
    lossCallbacks.forEach(function (cb) {
      cb()
    })
  }

  function handleContextRestored (event) {
    // clear error code
    gl.getError()

    // clear context lost flag
    contextLost = false

    // refresh state
    extensionState.restore()
    shaderState.restore()
    bufferState.restore()
    textureState.restore()
    renderbufferState.restore()
    framebufferState.restore()
    if (timer) {
      timer.restore()
    }

    // refresh state
    core.procs.refresh()

    // restart RAF
    startRAF()

    // restore context
    restoreCallbacks.forEach(function (cb) {
      cb()
    })
  }

  if (canvas) {
    canvas.addEventListener(CONTEXT_LOST_EVENT, handleContextLoss, false)
    canvas.addEventListener(CONTEXT_RESTORED_EVENT, handleContextRestored, false)
  }

  function destroy () {
    rafCallbacks.length = 0
    stopRAF()

    if (canvas) {
      canvas.removeEventListener(CONTEXT_LOST_EVENT, handleContextLoss)
      canvas.removeEventListener(CONTEXT_RESTORED_EVENT, handleContextRestored)
    }

    shaderState.clear()
    framebufferState.clear()
    renderbufferState.clear()
    textureState.clear()
    elementState.clear()
    bufferState.clear()

    if (timer) {
      timer.clear()
    }

    destroyCallbacks.forEach(function (cb) {
      cb()
    })
  }

  function compileProcedure (options) {
    
    

    function flattenNestedOptions (options) {
      var result = extend({}, options)
      delete result.uniforms
      delete result.attributes
      delete result.context

      if ('stencil' in result && result.stencil.op) {
        result.stencil.opBack = result.stencil.opFront = result.stencil.op
        delete result.stencil.op
      }

      function merge (name) {
        if (name in result) {
          var child = result[name]
          delete result[name]
          Object.keys(child).forEach(function (prop) {
            result[name + '.' + prop] = child[prop]
          })
        }
      }
      merge('blend')
      merge('depth')
      merge('cull')
      merge('stencil')
      merge('polygonOffset')
      merge('scissor')
      merge('sample')

      return result
    }

    function separateDynamic (object) {
      var staticItems = {}
      var dynamicItems = {}
      Object.keys(object).forEach(function (option) {
        var value = object[option]
        if (dynamic.isDynamic(value)) {
          dynamicItems[option] = dynamic.unbox(value, option)
        } else {
          staticItems[option] = value
        }
      })
      return {
        dynamic: dynamicItems,
        static: staticItems
      }
    }

    // Treat context variables separate from other dynamic variables
    var context = separateDynamic(options.context || {})
    var uniforms = separateDynamic(options.uniforms || {})
    var attributes = separateDynamic(options.attributes || {})
    var opts = separateDynamic(flattenNestedOptions(options))

    var stats = {
      gpuTime: 0.0,
      cpuTime: 0.0,
      count: 0
    }

    var compiled = core.compile(opts, attributes, uniforms, context, stats)

    var draw = compiled.draw
    var batch = compiled.batch
    var scope = compiled.scope

    // FIXME: we should modify code generation for batch commands so this
    // isn't necessary
    var EMPTY_ARRAY = []
    function reserve (count) {
      while (EMPTY_ARRAY.length < count) {
        EMPTY_ARRAY.push(null)
      }
      return EMPTY_ARRAY
    }

    function REGLCommand (args, body) {
      var i
      if (contextLost) {
        
      }
      if (typeof args === 'function') {
        return scope.call(this, null, args, 0)
      } else if (typeof body === 'function') {
        if (typeof args === 'number') {
          for (i = 0; i < args; ++i) {
            scope.call(this, null, body, i)
          }
          return
        } else if (Array.isArray(args)) {
          for (i = 0; i < args.length; ++i) {
            scope.call(this, args[i], body, i)
          }
          return
        } else {
          return scope.call(this, args, body, 0)
        }
      } else if (typeof args === 'number') {
        if (args > 0) {
          return batch.call(this, reserve(args | 0), args | 0)
        }
      } else if (Array.isArray(args)) {
        if (args.length) {
          return batch.call(this, args, args.length)
        }
      } else {
        return draw.call(this, args)
      }
    }

    return extend(REGLCommand, {
      stats: stats
    })
  }

  function clear (options) {
    

    var clearFlags = 0
    core.procs.poll()

    var c = options.color
    if (c) {
      gl.clearColor(+c[0] || 0, +c[1] || 0, +c[2] || 0, +c[3] || 0)
      clearFlags |= GL_COLOR_BUFFER_BIT
    }
    if ('depth' in options) {
      gl.clearDepth(+options.depth)
      clearFlags |= GL_DEPTH_BUFFER_BIT
    }
    if ('stencil' in options) {
      gl.clearStencil(options.stencil | 0)
      clearFlags |= GL_STENCIL_BUFFER_BIT
    }

    
    gl.clear(clearFlags)
  }

  function frame (cb) {
    
    rafCallbacks.push(cb)

    function cancel () {
      // FIXME:  should we check something other than equals cb here?
      // what if a user calls frame twice with the same callback...
      //
      var i = find(rafCallbacks, cb)
      
      function pendingCancel () {
        var index = find(rafCallbacks, pendingCancel)
        rafCallbacks[index] = rafCallbacks[rafCallbacks.length - 1]
        rafCallbacks.length -= 1
        if (rafCallbacks.length <= 0) {
          stopRAF()
        }
      }
      rafCallbacks[i] = pendingCancel
    }

    startRAF()

    return {
      cancel: cancel
    }
  }

  // poll viewport
  function pollViewport () {
    var viewport = nextState.viewport
    var scissorBox = nextState.scissor_box
    viewport[0] = viewport[1] = scissorBox[0] = scissorBox[1] = 0
    contextState.viewportWidth =
      contextState.framebufferWidth =
      contextState.drawingBufferWidth =
      viewport[2] =
      scissorBox[2] = gl.drawingBufferWidth
    contextState.viewportHeight =
      contextState.framebufferHeight =
      contextState.drawingBufferHeight =
      viewport[3] =
      scissorBox[3] = gl.drawingBufferHeight
  }

  function poll () {
    contextState.tick += 1
    contextState.time = now()
    pollViewport()
    core.procs.poll()
  }

  function refresh () {
    pollViewport()
    core.procs.refresh()
    if (timer) {
      timer.update()
    }
  }

  function now () {
    return (clock() - START_TIME) / 1000.0
  }

  refresh()

  function addListener (event, callback) {
    

    var callbacks
    switch (event) {
      case 'frame':
        return frame(callback)
      case 'lost':
        callbacks = lossCallbacks
        break
      case 'restore':
        callbacks = restoreCallbacks
        break
      case 'destroy':
        callbacks = destroyCallbacks
        break
      default:
        
    }

    callbacks.push(callback)
    return {
      cancel: function () {
        for (var i = 0; i < callbacks.length; ++i) {
          if (callbacks[i] === callback) {
            callbacks[i] = callbacks[callbacks.length - 1]
            callbacks.pop()
            return
          }
        }
      }
    }
  }

  var regl = extend(compileProcedure, {
    // Clear current FBO
    clear: clear,

    // Short cuts for dynamic variables
    prop: dynamic.define.bind(null, DYN_PROP),
    context: dynamic.define.bind(null, DYN_CONTEXT),
    this: dynamic.define.bind(null, DYN_STATE),

    // executes an empty draw command
    draw: compileProcedure({}),

    // Resources
    buffer: function (options) {
      return bufferState.create(options, GL_ARRAY_BUFFER, false, false)
    },
    elements: function (options) {
      return elementState.create(options, false)
    },
    texture: textureState.create2D,
    cube: textureState.createCube,
    renderbuffer: renderbufferState.create,
    framebuffer: framebufferState.create,
    framebufferCube: framebufferState.createCube,

    // Expose context attributes
    attributes: glAttributes,

    // Frame rendering
    frame: frame,
    on: addListener,

    // System limits
    limits: limits,
    hasExtension: function (name) {
      return limits.extensions.indexOf(name.toLowerCase()) >= 0
    },

    // Read pixels
    read: readPixels,

    // Destroy regl and all associated resources
    destroy: destroy,

    // Direct GL state manipulation
    _gl: gl,
    _refresh: refresh,

    poll: function () {
      poll()
      if (timer) {
        timer.update()
      }
    },

    // Current time
    now: now,

    // regl Statistics Information
    stats: stats
  })

  config.onDone(null, regl)

  return regl
}

},{"./lib/attribute":2,"./lib/buffer":3,"./lib/core":8,"./lib/dynamic":9,"./lib/elements":10,"./lib/extension":11,"./lib/framebuffer":12,"./lib/limits":13,"./lib/read":14,"./lib/renderbuffer":15,"./lib/shader":16,"./lib/stats":17,"./lib/strings":18,"./lib/texture":19,"./lib/timer":20,"./lib/util/clock":21,"./lib/util/extend":23,"./lib/util/raf":29,"./lib/webgl":32}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL2N1YmUuanMiLCJsaWIvYXR0cmlidXRlLmpzIiwibGliL2J1ZmZlci5qcyIsImxpYi9jb25zdGFudHMvYXJyYXl0eXBlcy5qc29uIiwibGliL2NvbnN0YW50cy9kdHlwZXMuanNvbiIsImxpYi9jb25zdGFudHMvcHJpbWl0aXZlcy5qc29uIiwibGliL2NvbnN0YW50cy91c2FnZS5qc29uIiwibGliL2NvcmUuanMiLCJsaWIvZHluYW1pYy5qcyIsImxpYi9lbGVtZW50cy5qcyIsImxpYi9leHRlbnNpb24uanMiLCJsaWIvZnJhbWVidWZmZXIuanMiLCJsaWIvbGltaXRzLmpzIiwibGliL3JlYWQuanMiLCJsaWIvcmVuZGVyYnVmZmVyLmpzIiwibGliL3NoYWRlci5qcyIsImxpYi9zdGF0cy5qcyIsImxpYi9zdHJpbmdzLmpzIiwibGliL3RleHR1cmUuanMiLCJsaWIvdGltZXIuanMiLCJsaWIvdXRpbC9jbG9jay5qcyIsImxpYi91dGlsL2NvZGVnZW4uanMiLCJsaWIvdXRpbC9leHRlbmQuanMiLCJsaWIvdXRpbC9pcy1hcnJheS1saWtlLmpzIiwibGliL3V0aWwvaXMtbmRhcnJheS5qcyIsImxpYi91dGlsL2lzLXR5cGVkLWFycmF5LmpzIiwibGliL3V0aWwvbG9vcC5qcyIsImxpYi91dGlsL3Bvb2wuanMiLCJsaWIvdXRpbC9yYWYuanMiLCJsaWIvdXRpbC90by1oYWxmLWZsb2F0LmpzIiwibGliL3V0aWwvdmFsdWVzLmpzIiwibGliL3dlYmdsLmpzIiwibm9kZV9tb2R1bGVzL2dsLW1hdDQvYWRqb2ludC5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L2Nsb25lLmpzIiwibm9kZV9tb2R1bGVzL2dsLW1hdDQvY29weS5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L2NyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L2RldGVybWluYW50LmpzIiwibm9kZV9tb2R1bGVzL2dsLW1hdDQvZnJvbVF1YXQuanMiLCJub2RlX21vZHVsZXMvZ2wtbWF0NC9mcm9tUm90YXRpb25UcmFuc2xhdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L2ZydXN0dW0uanMiLCJub2RlX21vZHVsZXMvZ2wtbWF0NC9pZGVudGl0eS5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dsLW1hdDQvaW52ZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2dsLW1hdDQvbG9va0F0LmpzIiwibm9kZV9tb2R1bGVzL2dsLW1hdDQvbXVsdGlwbHkuanMiLCJub2RlX21vZHVsZXMvZ2wtbWF0NC9vcnRoby5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L3BlcnNwZWN0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2dsLW1hdDQvcGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXcuanMiLCJub2RlX21vZHVsZXMvZ2wtbWF0NC9yb3RhdGUuanMiLCJub2RlX21vZHVsZXMvZ2wtbWF0NC9yb3RhdGVYLmpzIiwibm9kZV9tb2R1bGVzL2dsLW1hdDQvcm90YXRlWS5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L3JvdGF0ZVouanMiLCJub2RlX21vZHVsZXMvZ2wtbWF0NC9zY2FsZS5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L3N0ci5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L3RyYW5zbGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9nbC1tYXQ0L3RyYW5zcG9zZS5qcyIsIm5vZGVfbW9kdWxlcy9yZXNsL2luZGV4LmpzIiwicmVnbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNzZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy8vQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3haQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gIDxwPlRoaXMgZXhhbXBsZXMgcmVuZGVycyBhIHNwaW5uaW5nIHRleHR1cmVkIGN1YmUuPC9wPlxuXG4gKi9cblxuY29uc3QgcmVnbCA9IHJlcXVpcmUoJy4uL3JlZ2wnKSgpXG5jb25zdCBtYXQ0ID0gcmVxdWlyZSgnZ2wtbWF0NCcpXG5cbnZhciBjdWJlUG9zaXRpb24gPSBbXG4gIFstMC41LCArMC41LCArMC41XSwgWyswLjUsICswLjUsICswLjVdLCBbKzAuNSwgLTAuNSwgKzAuNV0sIFstMC41LCAtMC41LCArMC41XSwgLy8gcG9zaXRpdmUgeiBmYWNlLlxuICBbKzAuNSwgKzAuNSwgKzAuNV0sIFsrMC41LCArMC41LCAtMC41XSwgWyswLjUsIC0wLjUsIC0wLjVdLCBbKzAuNSwgLTAuNSwgKzAuNV0sIC8vIHBvc2l0aXZlIHggZmFjZVxuICBbKzAuNSwgKzAuNSwgLTAuNV0sIFstMC41LCArMC41LCAtMC41XSwgWy0wLjUsIC0wLjUsIC0wLjVdLCBbKzAuNSwgLTAuNSwgLTAuNV0sIC8vIG5lZ2F0aXZlIHogZmFjZVxuICBbLTAuNSwgKzAuNSwgLTAuNV0sIFstMC41LCArMC41LCArMC41XSwgWy0wLjUsIC0wLjUsICswLjVdLCBbLTAuNSwgLTAuNSwgLTAuNV0sIC8vIG5lZ2F0aXZlIHggZmFjZS5cbiAgWy0wLjUsICswLjUsIC0wLjVdLCBbKzAuNSwgKzAuNSwgLTAuNV0sIFsrMC41LCArMC41LCArMC41XSwgWy0wLjUsICswLjUsICswLjVdLCAvLyB0b3AgZmFjZVxuICBbLTAuNSwgLTAuNSwgLTAuNV0sIFsrMC41LCAtMC41LCAtMC41XSwgWyswLjUsIC0wLjUsICswLjVdLCBbLTAuNSwgLTAuNSwgKzAuNV0gIC8vIGJvdHRvbSBmYWNlXG5dXG5cbnZhciBjdWJlVXYgPSBbXG4gIFswLjAsIDAuMF0sIFsxLjAsIDAuMF0sIFsxLjAsIDEuMF0sIFswLjAsIDEuMF0sIC8vIHBvc2l0aXZlIHogZmFjZS5cbiAgWzAuMCwgMC4wXSwgWzEuMCwgMC4wXSwgWzEuMCwgMS4wXSwgWzAuMCwgMS4wXSwgLy8gcG9zaXRpdmUgeCBmYWNlLlxuICBbMC4wLCAwLjBdLCBbMS4wLCAwLjBdLCBbMS4wLCAxLjBdLCBbMC4wLCAxLjBdLCAvLyBuZWdhdGl2ZSB6IGZhY2UuXG4gIFswLjAsIDAuMF0sIFsxLjAsIDAuMF0sIFsxLjAsIDEuMF0sIFswLjAsIDEuMF0sIC8vIG5lZ2F0aXZlIHggZmFjZS5cbiAgWzAuMCwgMC4wXSwgWzEuMCwgMC4wXSwgWzEuMCwgMS4wXSwgWzAuMCwgMS4wXSwgLy8gdG9wIGZhY2VcbiAgWzAuMCwgMC4wXSwgWzEuMCwgMC4wXSwgWzEuMCwgMS4wXSwgWzAuMCwgMS4wXSAgLy8gYm90dG9tIGZhY2Vcbl1cblxuY29uc3QgY3ViZUVsZW1lbnRzID0gW1xuICBbMiwgMSwgMF0sIFsyLCAwLCAzXSwgICAgICAgLy8gcG9zaXRpdmUgeiBmYWNlLlxuICBbNiwgNSwgNF0sIFs2LCA0LCA3XSwgICAgICAgLy8gcG9zaXRpdmUgeCBmYWNlLlxuICBbMTAsIDksIDhdLCBbMTAsIDgsIDExXSwgICAgLy8gbmVnYXRpdmUgeiBmYWNlLlxuICBbMTQsIDEzLCAxMl0sIFsxNCwgMTIsIDE1XSwgLy8gbmVnYXRpdmUgeCBmYWNlLlxuICBbMTgsIDE3LCAxNl0sIFsxOCwgMTYsIDE5XSwgLy8gdG9wIGZhY2UuXG4gIFsyMCwgMjEsIDIyXSwgWzIzLCAyMCwgMjJdICAvLyBib3R0b20gZmFjZVxuXVxuXG5jb25zdCBkcmF3Q3ViZSA9IHJlZ2woe1xuICBmcmFnOiBgXG4gIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuICB2YXJ5aW5nIHZlYzIgdlV2O1xuICB1bmlmb3JtIHNhbXBsZXIyRCB0ZXg7XG4gIHZvaWQgbWFpbiAoKSB7XG4gICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHRleCx2VXYpO1xuICB9YCxcbiAgdmVydDogYFxuICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcbiAgYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XG4gIGF0dHJpYnV0ZSB2ZWMyIHV2O1xuICB2YXJ5aW5nIHZlYzIgdlV2O1xuICB1bmlmb3JtIG1hdDQgcHJvamVjdGlvbiwgdmlldztcbiAgdm9pZCBtYWluKCkge1xuICAgIHZVdiA9IHV2O1xuICAgIGdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbiAqIHZpZXcgKiB2ZWM0KHBvc2l0aW9uLCAxKTtcbiAgfWAsXG4gIGF0dHJpYnV0ZXM6IHtcbiAgICBwb3NpdGlvbjogY3ViZVBvc2l0aW9uLFxuICAgIHV2OiBjdWJlVXZcbiAgfSxcbiAgZWxlbWVudHM6IGN1YmVFbGVtZW50cyxcbiAgdW5pZm9ybXM6IHtcbiAgICB2aWV3OiAoe3RpY2t9KSA9PiB7XG4gICAgICBjb25zdCB0ID0gMC4wMSAqIHRpY2tcbiAgICAgIHJldHVybiBtYXQ0Lmxvb2tBdChbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBbNSAqIE1hdGguY29zKHQpLCAyLjUgKiBNYXRoLnNpbih0KSwgNSAqIE1hdGguc2luKHQpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBbMCwgMC4wLCAwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBbMCwgMSwgMF0pXG4gICAgfSxcbiAgICBwcm9qZWN0aW9uOiAoe3ZpZXdwb3J0V2lkdGgsIHZpZXdwb3J0SGVpZ2h0fSkgPT5cbiAgICAgIG1hdDQucGVyc3BlY3RpdmUoW10sXG4gICAgICAgICAgICAgICAgICAgICAgIE1hdGguUEkgLyA0LFxuICAgICAgICAgICAgICAgICAgICAgICB2aWV3cG9ydFdpZHRoIC8gdmlld3BvcnRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgIDAuMDEsXG4gICAgICAgICAgICAgICAgICAgICAgIDEwKSxcbiAgICB0ZXg6IHJlZ2wucHJvcCgndGV4dHVyZScpXG4gIH1cbn0pXG5cbnJlcXVpcmUoJ3Jlc2wnKSh7XG4gIG1hbmlmZXN0OiB7XG4gICAgdGV4dHVyZToge1xuICAgICAgdHlwZTogJ2ltYWdlJyxcbiAgICAgIHNyYzogJ2Fzc2V0cy9sZW5hLnBuZycsXG4gICAgICBwYXJzZXI6IChkYXRhKSA9PiByZWdsLnRleHR1cmUoe1xuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBtYWc6ICdsaW5lYXInLFxuICAgICAgICBtaW46ICdsaW5lYXInXG4gICAgICB9KVxuICAgIH1cbiAgfSxcbiAgb25Eb25lOiAoe3RleHR1cmV9KSA9PiB7XG4gICAgcmVnbC5mcmFtZSgoKSA9PiB7XG4gICAgICByZWdsLmNsZWFyKHtcbiAgICAgICAgY29sb3I6IFswLCAwLCAwLCAyNTVdLFxuICAgICAgICBkZXB0aDogMVxuICAgICAgfSlcbiAgICAgIGRyYXdDdWJlKHt0ZXh0dXJlfSlcbiAgICB9KVxuICB9XG59KVxuIiwidmFyIEdMX0ZMT0FUID0gNTEyNlxuXG5mdW5jdGlvbiBBdHRyaWJ1dGVSZWNvcmQgKCkge1xuICB0aGlzLnN0YXRlID0gMFxuXG4gIHRoaXMueCA9IDAuMFxuICB0aGlzLnkgPSAwLjBcbiAgdGhpcy56ID0gMC4wXG4gIHRoaXMudyA9IDAuMFxuXG4gIHRoaXMuYnVmZmVyID0gbnVsbFxuICB0aGlzLnNpemUgPSAwXG4gIHRoaXMubm9ybWFsaXplZCA9IGZhbHNlXG4gIHRoaXMudHlwZSA9IEdMX0ZMT0FUXG4gIHRoaXMub2Zmc2V0ID0gMFxuICB0aGlzLnN0cmlkZSA9IDBcbiAgdGhpcy5kaXZpc29yID0gMFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHdyYXBBdHRyaWJ1dGVTdGF0ZSAoXG4gIGdsLFxuICBleHRlbnNpb25zLFxuICBsaW1pdHMsXG4gIGJ1ZmZlclN0YXRlLFxuICBzdHJpbmdTdG9yZSkge1xuICB2YXIgTlVNX0FUVFJJQlVURVMgPSBsaW1pdHMubWF4QXR0cmlidXRlc1xuICB2YXIgYXR0cmlidXRlQmluZGluZ3MgPSBuZXcgQXJyYXkoTlVNX0FUVFJJQlVURVMpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTlVNX0FUVFJJQlVURVM7ICsraSkge1xuICAgIGF0dHJpYnV0ZUJpbmRpbmdzW2ldID0gbmV3IEF0dHJpYnV0ZVJlY29yZCgpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIFJlY29yZDogQXR0cmlidXRlUmVjb3JkLFxuICAgIHNjb3BlOiB7fSxcbiAgICBzdGF0ZTogYXR0cmlidXRlQmluZGluZ3NcbiAgfVxufVxuIiwiXG52YXIgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi91dGlsL2lzLXR5cGVkLWFycmF5JylcbnZhciBpc05EQXJyYXlMaWtlID0gcmVxdWlyZSgnLi91dGlsL2lzLW5kYXJyYXknKVxudmFyIHZhbHVlcyA9IHJlcXVpcmUoJy4vdXRpbC92YWx1ZXMnKVxudmFyIHBvb2wgPSByZXF1aXJlKCcuL3V0aWwvcG9vbCcpXG5cbnZhciBhcnJheVR5cGVzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvYXJyYXl0eXBlcy5qc29uJylcbnZhciBidWZmZXJUeXBlcyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzL2R0eXBlcy5qc29uJylcbnZhciB1c2FnZVR5cGVzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvdXNhZ2UuanNvbicpXG5cbnZhciBHTF9TVEFUSUNfRFJBVyA9IDB4ODhFNFxudmFyIEdMX1NUUkVBTV9EUkFXID0gMHg4OEUwXG5cbnZhciBHTF9VTlNJR05FRF9CWVRFID0gNTEyMVxudmFyIEdMX0ZMT0FUID0gNTEyNlxuXG52YXIgRFRZUEVTX1NJWkVTID0gW11cbkRUWVBFU19TSVpFU1s1MTIwXSA9IDEgLy8gaW50OFxuRFRZUEVTX1NJWkVTWzUxMjJdID0gMiAvLyBpbnQxNlxuRFRZUEVTX1NJWkVTWzUxMjRdID0gNCAvLyBpbnQzMlxuRFRZUEVTX1NJWkVTWzUxMjFdID0gMSAvLyB1aW50OFxuRFRZUEVTX1NJWkVTWzUxMjNdID0gMiAvLyB1aW50MTZcbkRUWVBFU19TSVpFU1s1MTI1XSA9IDQgLy8gdWludDMyXG5EVFlQRVNfU0laRVNbNTEyNl0gPSA0IC8vIGZsb2F0MzJcblxuZnVuY3Rpb24gdHlwZWRBcnJheUNvZGUgKGRhdGEpIHtcbiAgcmV0dXJuIGFycmF5VHlwZXNbT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpXSB8IDBcbn1cblxuZnVuY3Rpb24gY29weUFycmF5IChvdXQsIGlucCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGlucC5sZW5ndGg7ICsraSkge1xuICAgIG91dFtpXSA9IGlucFtpXVxuICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zcG9zZSAoXG4gIHJlc3VsdCwgZGF0YSwgc2hhcGVYLCBzaGFwZVksIHN0cmlkZVgsIHN0cmlkZVksIG9mZnNldCkge1xuICB2YXIgcHRyID0gMFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHNoYXBlWDsgKytpKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBzaGFwZVk7ICsraikge1xuICAgICAgcmVzdWx0W3B0cisrXSA9IGRhdGFbc3RyaWRlWCAqIGkgKyBzdHJpZGVZICogaiArIG9mZnNldF1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZmxhdHRlbiAocmVzdWx0LCBkYXRhLCBkaW1lbnNpb24pIHtcbiAgdmFyIHB0ciA9IDBcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHYgPSBkYXRhW2ldXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBkaW1lbnNpb247ICsraikge1xuICAgICAgcmVzdWx0W3B0cisrXSA9IHZbal1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3cmFwQnVmZmVyU3RhdGUgKGdsLCBzdGF0cywgY29uZmlnKSB7XG4gIHZhciBidWZmZXJDb3VudCA9IDBcbiAgdmFyIGJ1ZmZlclNldCA9IHt9XG5cbiAgZnVuY3Rpb24gUkVHTEJ1ZmZlciAodHlwZSkge1xuICAgIHRoaXMuaWQgPSBidWZmZXJDb3VudCsrXG4gICAgdGhpcy5idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKVxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLnVzYWdlID0gR0xfU1RBVElDX0RSQVdcbiAgICB0aGlzLmJ5dGVMZW5ndGggPSAwXG4gICAgdGhpcy5kaW1lbnNpb24gPSAxXG4gICAgdGhpcy5kdHlwZSA9IEdMX1VOU0lHTkVEX0JZVEVcblxuICAgIHRoaXMucGVyc2lzdGVudERhdGEgPSBudWxsXG5cbiAgICBpZiAoY29uZmlnLnByb2ZpbGUpIHtcbiAgICAgIHRoaXMuc3RhdHMgPSB7c2l6ZTogMH1cbiAgICB9XG4gIH1cblxuICBSRUdMQnVmZmVyLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgIGdsLmJpbmRCdWZmZXIodGhpcy50eXBlLCB0aGlzLmJ1ZmZlcilcbiAgfVxuXG4gIFJFR0xCdWZmZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgZGVzdHJveSh0aGlzKVxuICB9XG5cbiAgdmFyIHN0cmVhbVBvb2wgPSBbXVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVN0cmVhbSAodHlwZSwgZGF0YSkge1xuICAgIHZhciBidWZmZXIgPSBzdHJlYW1Qb29sLnBvcCgpXG4gICAgaWYgKCFidWZmZXIpIHtcbiAgICAgIGJ1ZmZlciA9IG5ldyBSRUdMQnVmZmVyKHR5cGUpXG4gICAgfVxuICAgIGJ1ZmZlci5iaW5kKClcbiAgICBpbml0QnVmZmVyRnJvbURhdGEoYnVmZmVyLCBkYXRhLCBHTF9TVFJFQU1fRFJBVywgMCwgMSwgZmFsc2UpXG4gICAgcmV0dXJuIGJ1ZmZlclxuICB9XG5cbiAgZnVuY3Rpb24gZGVzdHJveVN0cmVhbSAoc3RyZWFtKSB7XG4gICAgc3RyZWFtUG9vbC5wdXNoKHN0cmVhbSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRCdWZmZXJGcm9tVHlwZWRBcnJheSAoYnVmZmVyLCBkYXRhLCB1c2FnZSkge1xuICAgIGJ1ZmZlci5ieXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoXG4gICAgZ2wuYnVmZmVyRGF0YShidWZmZXIudHlwZSwgZGF0YSwgdXNhZ2UpXG4gIH1cblxuICBmdW5jdGlvbiBpbml0QnVmZmVyRnJvbURhdGEgKGJ1ZmZlciwgZGF0YSwgdXNhZ2UsIGR0eXBlLCBkaW1lbnNpb24sIHBlcnNpc3QpIHtcbiAgICBidWZmZXIudXNhZ2UgPSB1c2FnZVxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICBidWZmZXIuZHR5cGUgPSBkdHlwZSB8fCBHTF9GTE9BVFxuICAgICAgaWYgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgZmxhdERhdGFcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YVswXSkpIHtcbiAgICAgICAgICBidWZmZXIuZGltZW5zaW9uID0gZGF0YVswXS5sZW5ndGhcbiAgICAgICAgICBmbGF0RGF0YSA9IHBvb2wuYWxsb2NUeXBlKFxuICAgICAgICAgICAgYnVmZmVyLmR0eXBlLFxuICAgICAgICAgICAgZGF0YS5sZW5ndGggKiBidWZmZXIuZGltZW5zaW9uKVxuICAgICAgICAgIGZsYXR0ZW4oZmxhdERhdGEsIGRhdGEsIGJ1ZmZlci5kaW1lbnNpb24pXG4gICAgICAgICAgaW5pdEJ1ZmZlckZyb21UeXBlZEFycmF5KGJ1ZmZlciwgZmxhdERhdGEsIHVzYWdlKVxuICAgICAgICAgIGlmIChwZXJzaXN0KSB7XG4gICAgICAgICAgICBidWZmZXIucGVyc2lzdGVudERhdGEgPSBmbGF0RGF0YVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwb29sLmZyZWVUeXBlKGZsYXREYXRhKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YVswXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBidWZmZXIuZGltZW5zaW9uID0gZGltZW5zaW9uXG4gICAgICAgICAgdmFyIHR5cGVkRGF0YSA9IHBvb2wuYWxsb2NUeXBlKGJ1ZmZlci5kdHlwZSwgZGF0YS5sZW5ndGgpXG4gICAgICAgICAgY29weUFycmF5KHR5cGVkRGF0YSwgZGF0YSlcbiAgICAgICAgICBpbml0QnVmZmVyRnJvbVR5cGVkQXJyYXkoYnVmZmVyLCB0eXBlZERhdGEsIHVzYWdlKVxuICAgICAgICAgIGlmIChwZXJzaXN0KSB7XG4gICAgICAgICAgICBidWZmZXIucGVyc2lzdGVudERhdGEgPSB0eXBlZERhdGFcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9vbC5mcmVlVHlwZSh0eXBlZERhdGEpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGlzVHlwZWRBcnJheShkYXRhWzBdKSkge1xuICAgICAgICAgIGJ1ZmZlci5kaW1lbnNpb24gPSBkYXRhWzBdLmxlbmd0aFxuICAgICAgICAgIGJ1ZmZlci5kdHlwZSA9IGR0eXBlIHx8IHR5cGVkQXJyYXlDb2RlKGRhdGFbMF0pIHx8IEdMX0ZMT0FUXG4gICAgICAgICAgZmxhdERhdGEgPSBwb29sLmFsbG9jVHlwZShcbiAgICAgICAgICAgIGJ1ZmZlci5kdHlwZSxcbiAgICAgICAgICAgIGRhdGEubGVuZ3RoICogYnVmZmVyLmRpbWVuc2lvbilcbiAgICAgICAgICBmbGF0dGVuKGZsYXREYXRhLCBkYXRhLCBidWZmZXIuZGltZW5zaW9uKVxuICAgICAgICAgIGluaXRCdWZmZXJGcm9tVHlwZWRBcnJheShidWZmZXIsIGZsYXREYXRhLCB1c2FnZSlcbiAgICAgICAgICBpZiAocGVyc2lzdCkge1xuICAgICAgICAgICAgYnVmZmVyLnBlcnNpc3RlbnREYXRhID0gZmxhdERhdGFcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9vbC5mcmVlVHlwZShmbGF0RGF0YSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVHlwZWRBcnJheShkYXRhKSkge1xuICAgICAgYnVmZmVyLmR0eXBlID0gZHR5cGUgfHwgdHlwZWRBcnJheUNvZGUoZGF0YSlcbiAgICAgIGJ1ZmZlci5kaW1lbnNpb24gPSBkaW1lbnNpb25cbiAgICAgIGluaXRCdWZmZXJGcm9tVHlwZWRBcnJheShidWZmZXIsIGRhdGEsIHVzYWdlKVxuICAgICAgaWYgKHBlcnNpc3QpIHtcbiAgICAgICAgYnVmZmVyLnBlcnNpc3RlbnREYXRhID0gbmV3IFVpbnQ4QXJyYXkobmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIpKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNOREFycmF5TGlrZShkYXRhKSkge1xuICAgICAgdmFyIHNoYXBlID0gZGF0YS5zaGFwZVxuICAgICAgdmFyIHN0cmlkZSA9IGRhdGEuc3RyaWRlXG4gICAgICB2YXIgb2Zmc2V0ID0gZGF0YS5vZmZzZXRcblxuICAgICAgdmFyIHNoYXBlWCA9IDBcbiAgICAgIHZhciBzaGFwZVkgPSAwXG4gICAgICB2YXIgc3RyaWRlWCA9IDBcbiAgICAgIHZhciBzdHJpZGVZID0gMFxuICAgICAgaWYgKHNoYXBlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBzaGFwZVggPSBzaGFwZVswXVxuICAgICAgICBzaGFwZVkgPSAxXG4gICAgICAgIHN0cmlkZVggPSBzdHJpZGVbMF1cbiAgICAgICAgc3RyaWRlWSA9IDBcbiAgICAgIH0gZWxzZSBpZiAoc2hhcGUubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHNoYXBlWCA9IHNoYXBlWzBdXG4gICAgICAgIHNoYXBlWSA9IHNoYXBlWzFdXG4gICAgICAgIHN0cmlkZVggPSBzdHJpZGVbMF1cbiAgICAgICAgc3RyaWRlWSA9IHN0cmlkZVsxXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgXG4gICAgICB9XG5cbiAgICAgIGJ1ZmZlci5kdHlwZSA9IGR0eXBlIHx8IHR5cGVkQXJyYXlDb2RlKGRhdGEuZGF0YSkgfHwgR0xfRkxPQVRcbiAgICAgIGJ1ZmZlci5kaW1lbnNpb24gPSBzaGFwZVlcblxuICAgICAgdmFyIHRyYW5zcG9zZURhdGEgPSBwb29sLmFsbG9jVHlwZShidWZmZXIuZHR5cGUsIHNoYXBlWCAqIHNoYXBlWSlcbiAgICAgIHRyYW5zcG9zZSh0cmFuc3Bvc2VEYXRhLFxuICAgICAgICBkYXRhLmRhdGEsXG4gICAgICAgIHNoYXBlWCwgc2hhcGVZLFxuICAgICAgICBzdHJpZGVYLCBzdHJpZGVZLFxuICAgICAgICBvZmZzZXQpXG4gICAgICBpbml0QnVmZmVyRnJvbVR5cGVkQXJyYXkoYnVmZmVyLCB0cmFuc3Bvc2VEYXRhLCB1c2FnZSlcbiAgICAgIGlmIChwZXJzaXN0KSB7XG4gICAgICAgIGJ1ZmZlci5wZXJzaXN0ZW50RGF0YSA9IHRyYW5zcG9zZURhdGFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvb2wuZnJlZVR5cGUodHJhbnNwb3NlRGF0YSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGVzdHJveSAoYnVmZmVyKSB7XG4gICAgc3RhdHMuYnVmZmVyQ291bnQtLVxuXG4gICAgdmFyIGhhbmRsZSA9IGJ1ZmZlci5idWZmZXJcbiAgICBcbiAgICBnbC5kZWxldGVCdWZmZXIoaGFuZGxlKVxuICAgIGJ1ZmZlci5idWZmZXIgPSBudWxsXG4gICAgZGVsZXRlIGJ1ZmZlclNldFtidWZmZXIuaWRdXG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVCdWZmZXIgKG9wdGlvbnMsIHR5cGUsIGRlZmVySW5pdCwgcGVyc2lzdGVudCkge1xuICAgIHN0YXRzLmJ1ZmZlckNvdW50KytcblxuICAgIHZhciBidWZmZXIgPSBuZXcgUkVHTEJ1ZmZlcih0eXBlKVxuICAgIGJ1ZmZlclNldFtidWZmZXIuaWRdID0gYnVmZmVyXG5cbiAgICBmdW5jdGlvbiByZWdsQnVmZmVyIChvcHRpb25zKSB7XG4gICAgICB2YXIgdXNhZ2UgPSBHTF9TVEFUSUNfRFJBV1xuICAgICAgdmFyIGRhdGEgPSBudWxsXG4gICAgICB2YXIgYnl0ZUxlbmd0aCA9IDBcbiAgICAgIHZhciBkdHlwZSA9IDBcbiAgICAgIHZhciBkaW1lbnNpb24gPSAxXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSB8fFxuICAgICAgICAgIGlzVHlwZWRBcnJheShvcHRpb25zKSB8fFxuICAgICAgICAgIGlzTkRBcnJheUxpa2Uob3B0aW9ucykpIHtcbiAgICAgICAgZGF0YSA9IG9wdGlvbnNcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGJ5dGVMZW5ndGggPSBvcHRpb25zIHwgMFxuICAgICAgfSBlbHNlIGlmIChvcHRpb25zKSB7XG4gICAgICAgIFxuXG4gICAgICAgIGlmICgnZGF0YScgaW4gb3B0aW9ucykge1xuICAgICAgICAgIFxuICAgICAgICAgIGRhdGEgPSBvcHRpb25zLmRhdGFcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgndXNhZ2UnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICBcbiAgICAgICAgICB1c2FnZSA9IHVzYWdlVHlwZXNbb3B0aW9ucy51c2FnZV1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgndHlwZScgaW4gb3B0aW9ucykge1xuICAgICAgICAgIFxuICAgICAgICAgIGR0eXBlID0gYnVmZmVyVHlwZXNbb3B0aW9ucy50eXBlXVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCdkaW1lbnNpb24nIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICBcbiAgICAgICAgICBkaW1lbnNpb24gPSBvcHRpb25zLmRpbWVuc2lvbiB8IDBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgnbGVuZ3RoJyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgXG4gICAgICAgICAgYnl0ZUxlbmd0aCA9IG9wdGlvbnMubGVuZ3RoIHwgMFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGJ1ZmZlci5iaW5kKClcbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICBnbC5idWZmZXJEYXRhKGJ1ZmZlci50eXBlLCBieXRlTGVuZ3RoLCB1c2FnZSlcbiAgICAgICAgYnVmZmVyLmR0eXBlID0gZHR5cGUgfHwgR0xfVU5TSUdORURfQllURVxuICAgICAgICBidWZmZXIudXNhZ2UgPSB1c2FnZVxuICAgICAgICBidWZmZXIuZGltZW5zaW9uID0gZGltZW5zaW9uXG4gICAgICAgIGJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5pdEJ1ZmZlckZyb21EYXRhKGJ1ZmZlciwgZGF0YSwgdXNhZ2UsIGR0eXBlLCBkaW1lbnNpb24sIHBlcnNpc3RlbnQpXG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcucHJvZmlsZSkge1xuICAgICAgICBidWZmZXIuc3RhdHMuc2l6ZSA9IGJ1ZmZlci5ieXRlTGVuZ3RoICogRFRZUEVTX1NJWkVTW2J1ZmZlci5kdHlwZV1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlZ2xCdWZmZXJcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRTdWJEYXRhIChkYXRhLCBvZmZzZXQpIHtcbiAgICAgIFxuXG4gICAgICBnbC5idWZmZXJTdWJEYXRhKGJ1ZmZlci50eXBlLCBvZmZzZXQsIGRhdGEpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3ViZGF0YSAoZGF0YSwgb2Zmc2V0Xykge1xuICAgICAgdmFyIG9mZnNldCA9IChvZmZzZXRfIHx8IDApIHwgMFxuICAgICAgYnVmZmVyLmJpbmQoKVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgZGF0YVswXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHZhciBjb252ZXJ0ZWQgPSBwb29sLmFsbG9jVHlwZShidWZmZXIuZHR5cGUsIGRhdGEubGVuZ3RoKVxuICAgICAgICAgICAgY29weUFycmF5KGNvbnZlcnRlZCwgZGF0YSlcbiAgICAgICAgICAgIHNldFN1YkRhdGEoY29udmVydGVkLCBvZmZzZXQpXG4gICAgICAgICAgICBwb29sLmZyZWVUeXBlKGNvbnZlcnRlZClcbiAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZGF0YVswXSkgfHwgaXNUeXBlZEFycmF5KGRhdGFbMF0pKSB7XG4gICAgICAgICAgICB2YXIgZGltZW5zaW9uID0gZGF0YVswXS5sZW5ndGhcbiAgICAgICAgICAgIHZhciBmbGF0RGF0YSA9IHBvb2wuYWxsb2NUeXBlKGJ1ZmZlci5kdHlwZSwgZGF0YS5sZW5ndGggKiBkaW1lbnNpb24pXG4gICAgICAgICAgICBmbGF0dGVuKGZsYXREYXRhLCBkYXRhLCBkaW1lbnNpb24pXG4gICAgICAgICAgICBzZXRTdWJEYXRhKGZsYXREYXRhLCBvZmZzZXQpXG4gICAgICAgICAgICBwb29sLmZyZWVUeXBlKGZsYXREYXRhKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNUeXBlZEFycmF5KGRhdGEpKSB7XG4gICAgICAgIHNldFN1YkRhdGEoZGF0YSwgb2Zmc2V0KVxuICAgICAgfSBlbHNlIGlmIChpc05EQXJyYXlMaWtlKGRhdGEpKSB7XG4gICAgICAgIHZhciBzaGFwZSA9IGRhdGEuc2hhcGVcbiAgICAgICAgdmFyIHN0cmlkZSA9IGRhdGEuc3RyaWRlXG5cbiAgICAgICAgdmFyIHNoYXBlWCA9IDBcbiAgICAgICAgdmFyIHNoYXBlWSA9IDBcbiAgICAgICAgdmFyIHN0cmlkZVggPSAwXG4gICAgICAgIHZhciBzdHJpZGVZID0gMFxuICAgICAgICBpZiAoc2hhcGUubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgc2hhcGVYID0gc2hhcGVbMF1cbiAgICAgICAgICBzaGFwZVkgPSAxXG4gICAgICAgICAgc3RyaWRlWCA9IHN0cmlkZVswXVxuICAgICAgICAgIHN0cmlkZVkgPSAwXG4gICAgICAgIH0gZWxzZSBpZiAoc2hhcGUubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgc2hhcGVYID0gc2hhcGVbMF1cbiAgICAgICAgICBzaGFwZVkgPSBzaGFwZVsxXVxuICAgICAgICAgIHN0cmlkZVggPSBzdHJpZGVbMF1cbiAgICAgICAgICBzdHJpZGVZID0gc3RyaWRlWzFdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGR0eXBlID0gQXJyYXkuaXNBcnJheShkYXRhLmRhdGEpXG4gICAgICAgICAgPyBidWZmZXIuZHR5cGVcbiAgICAgICAgICA6IHR5cGVkQXJyYXlDb2RlKGRhdGEuZGF0YSlcblxuICAgICAgICB2YXIgdHJhbnNwb3NlRGF0YSA9IHBvb2wuYWxsb2NUeXBlKGR0eXBlLCBzaGFwZVggKiBzaGFwZVkpXG4gICAgICAgIHRyYW5zcG9zZSh0cmFuc3Bvc2VEYXRhLFxuICAgICAgICAgIGRhdGEuZGF0YSxcbiAgICAgICAgICBzaGFwZVgsIHNoYXBlWSxcbiAgICAgICAgICBzdHJpZGVYLCBzdHJpZGVZLFxuICAgICAgICAgIGRhdGEub2Zmc2V0KVxuICAgICAgICBzZXRTdWJEYXRhKHRyYW5zcG9zZURhdGEsIG9mZnNldClcbiAgICAgICAgcG9vbC5mcmVlVHlwZSh0cmFuc3Bvc2VEYXRhKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVnbEJ1ZmZlclxuICAgIH1cblxuICAgIGlmICghZGVmZXJJbml0KSB7XG4gICAgICByZWdsQnVmZmVyKG9wdGlvbnMpXG4gICAgfVxuXG4gICAgcmVnbEJ1ZmZlci5fcmVnbFR5cGUgPSAnYnVmZmVyJ1xuICAgIHJlZ2xCdWZmZXIuX2J1ZmZlciA9IGJ1ZmZlclxuICAgIHJlZ2xCdWZmZXIuc3ViZGF0YSA9IHN1YmRhdGFcbiAgICBpZiAoY29uZmlnLnByb2ZpbGUpIHtcbiAgICAgIHJlZ2xCdWZmZXIuc3RhdHMgPSBidWZmZXIuc3RhdHNcbiAgICB9XG4gICAgcmVnbEJ1ZmZlci5kZXN0cm95ID0gZnVuY3Rpb24gKCkgeyBkZXN0cm95KGJ1ZmZlcikgfVxuXG4gICAgcmV0dXJuIHJlZ2xCdWZmZXJcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc3RvcmVCdWZmZXJzICgpIHtcbiAgICB2YWx1ZXMoYnVmZmVyU2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgICAgIGJ1ZmZlci5idWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKVxuICAgICAgZ2wuYmluZEJ1ZmZlcihidWZmZXIudHlwZSwgYnVmZmVyLmJ1ZmZlcilcbiAgICAgIGdsLmJ1ZmZlckRhdGEoXG4gICAgICAgIGJ1ZmZlci50eXBlLCBidWZmZXIucGVyc2lzdGVudERhdGEgfHwgYnVmZmVyLmJ5dGVMZW5ndGgsIGJ1ZmZlci51c2FnZSlcbiAgICB9KVxuICB9XG5cbiAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgc3RhdHMuZ2V0VG90YWxCdWZmZXJTaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHRvdGFsID0gMFxuICAgICAgLy8gVE9ETzogUmlnaHQgbm93LCB0aGUgc3RyZWFtcyBhcmUgbm90IHBhcnQgb2YgdGhlIHRvdGFsIGNvdW50LlxuICAgICAgT2JqZWN0LmtleXMoYnVmZmVyU2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdG90YWwgKz0gYnVmZmVyU2V0W2tleV0uc3RhdHMuc2l6ZVxuICAgICAgfSlcbiAgICAgIHJldHVybiB0b3RhbFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlOiBjcmVhdGVCdWZmZXIsXG5cbiAgICBjcmVhdGVTdHJlYW06IGNyZWF0ZVN0cmVhbSxcbiAgICBkZXN0cm95U3RyZWFtOiBkZXN0cm95U3RyZWFtLFxuXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhbHVlcyhidWZmZXJTZXQpLmZvckVhY2goZGVzdHJveSlcbiAgICAgIHN0cmVhbVBvb2wuZm9yRWFjaChkZXN0cm95KVxuICAgIH0sXG5cbiAgICBnZXRCdWZmZXI6IGZ1bmN0aW9uICh3cmFwcGVyKSB7XG4gICAgICBpZiAod3JhcHBlciAmJiB3cmFwcGVyLl9idWZmZXIgaW5zdGFuY2VvZiBSRUdMQnVmZmVyKSB7XG4gICAgICAgIHJldHVybiB3cmFwcGVyLl9idWZmZXJcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsXG4gICAgfSxcblxuICAgIHJlc3RvcmU6IHJlc3RvcmVCdWZmZXJzLFxuXG4gICAgX2luaXRCdWZmZXI6IGluaXRCdWZmZXJGcm9tRGF0YVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiW29iamVjdCBJbnQ4QXJyYXldXCI6IDUxMjBcbiwgXCJbb2JqZWN0IEludDE2QXJyYXldXCI6IDUxMjJcbiwgXCJbb2JqZWN0IEludDMyQXJyYXldXCI6IDUxMjRcbiwgXCJbb2JqZWN0IFVpbnQ4QXJyYXldXCI6IDUxMjFcbiwgXCJbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XVwiOiA1MTIxXG4sIFwiW29iamVjdCBVaW50MTZBcnJheV1cIjogNTEyM1xuLCBcIltvYmplY3QgVWludDMyQXJyYXldXCI6IDUxMjVcbiwgXCJbb2JqZWN0IEZsb2F0MzJBcnJheV1cIjogNTEyNlxuLCBcIltvYmplY3QgRmxvYXQ2NEFycmF5XVwiOiA1MTIxXG4sIFwiW29iamVjdCBBcnJheUJ1ZmZlcl1cIjogNTEyMVxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImludDhcIjogNTEyMFxuLCBcImludDE2XCI6IDUxMjJcbiwgXCJpbnQzMlwiOiA1MTI0XG4sIFwidWludDhcIjogNTEyMVxuLCBcInVpbnQxNlwiOiA1MTIzXG4sIFwidWludDMyXCI6IDUxMjVcbiwgXCJmbG9hdFwiOiA1MTI2XG4sIFwiZmxvYXQzMlwiOiA1MTI2XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwicG9pbnRzXCI6IDAsXG4gIFwicG9pbnRcIjogMCxcbiAgXCJsaW5lc1wiOiAxLFxuICBcImxpbmVcIjogMSxcbiAgXCJsaW5lIGxvb3BcIjogMixcbiAgXCJsaW5lIHN0cmlwXCI6IDMsXG4gIFwidHJpYW5nbGVzXCI6IDQsXG4gIFwidHJpYW5nbGVcIjogNCxcbiAgXCJ0cmlhbmdsZSBzdHJpcFwiOiA1LFxuICBcInRyaWFuZ2xlIGZhblwiOiA2XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwic3RhdGljXCI6IDM1MDQ0LFxuICBcImR5bmFtaWNcIjogMzUwNDgsXG4gIFwic3RyZWFtXCI6IDM1MDQwXG59XG4iLCJcbnZhciBjcmVhdGVFbnZpcm9ubWVudCA9IHJlcXVpcmUoJy4vdXRpbC9jb2RlZ2VuJylcbnZhciBsb29wID0gcmVxdWlyZSgnLi91dGlsL2xvb3AnKVxudmFyIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vdXRpbC9pcy10eXBlZC1hcnJheScpXG52YXIgaXNOREFycmF5ID0gcmVxdWlyZSgnLi91dGlsL2lzLW5kYXJyYXknKVxudmFyIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi91dGlsL2lzLWFycmF5LWxpa2UnKVxudmFyIGR5bmFtaWMgPSByZXF1aXJlKCcuL2R5bmFtaWMnKVxuXG52YXIgcHJpbVR5cGVzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvcHJpbWl0aXZlcy5qc29uJylcbnZhciBnbFR5cGVzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvZHR5cGVzLmpzb24nKVxuXG4vLyBcImN1dGVcIiBuYW1lcyBmb3IgdmVjdG9yIGNvbXBvbmVudHNcbnZhciBDVVRFX0NPTVBPTkVOVFMgPSAneHl6dycuc3BsaXQoJycpXG5cbnZhciBHTF9VTlNJR05FRF9CWVRFID0gNTEyMVxuXG52YXIgQVRUUklCX1NUQVRFX1BPSU5URVIgPSAxXG52YXIgQVRUUklCX1NUQVRFX0NPTlNUQU5UID0gMlxuXG52YXIgRFlOX0ZVTkMgPSAwXG52YXIgRFlOX1BST1AgPSAxXG52YXIgRFlOX0NPTlRFWFQgPSAyXG52YXIgRFlOX1NUQVRFID0gM1xudmFyIERZTl9USFVOSyA9IDRcblxudmFyIFNfRElUSEVSID0gJ2RpdGhlcidcbnZhciBTX0JMRU5EX0VOQUJMRSA9ICdibGVuZC5lbmFibGUnXG52YXIgU19CTEVORF9DT0xPUiA9ICdibGVuZC5jb2xvcidcbnZhciBTX0JMRU5EX0VRVUFUSU9OID0gJ2JsZW5kLmVxdWF0aW9uJ1xudmFyIFNfQkxFTkRfRlVOQyA9ICdibGVuZC5mdW5jJ1xudmFyIFNfREVQVEhfRU5BQkxFID0gJ2RlcHRoLmVuYWJsZSdcbnZhciBTX0RFUFRIX0ZVTkMgPSAnZGVwdGguZnVuYydcbnZhciBTX0RFUFRIX1JBTkdFID0gJ2RlcHRoLnJhbmdlJ1xudmFyIFNfREVQVEhfTUFTSyA9ICdkZXB0aC5tYXNrJ1xudmFyIFNfQ09MT1JfTUFTSyA9ICdjb2xvck1hc2snXG52YXIgU19DVUxMX0VOQUJMRSA9ICdjdWxsLmVuYWJsZSdcbnZhciBTX0NVTExfRkFDRSA9ICdjdWxsLmZhY2UnXG52YXIgU19GUk9OVF9GQUNFID0gJ2Zyb250RmFjZSdcbnZhciBTX0xJTkVfV0lEVEggPSAnbGluZVdpZHRoJ1xudmFyIFNfUE9MWUdPTl9PRkZTRVRfRU5BQkxFID0gJ3BvbHlnb25PZmZzZXQuZW5hYmxlJ1xudmFyIFNfUE9MWUdPTl9PRkZTRVRfT0ZGU0VUID0gJ3BvbHlnb25PZmZzZXQub2Zmc2V0J1xudmFyIFNfU0FNUExFX0FMUEhBID0gJ3NhbXBsZS5hbHBoYSdcbnZhciBTX1NBTVBMRV9FTkFCTEUgPSAnc2FtcGxlLmVuYWJsZSdcbnZhciBTX1NBTVBMRV9DT1ZFUkFHRSA9ICdzYW1wbGUuY292ZXJhZ2UnXG52YXIgU19TVEVOQ0lMX0VOQUJMRSA9ICdzdGVuY2lsLmVuYWJsZSdcbnZhciBTX1NURU5DSUxfTUFTSyA9ICdzdGVuY2lsLm1hc2snXG52YXIgU19TVEVOQ0lMX0ZVTkMgPSAnc3RlbmNpbC5mdW5jJ1xudmFyIFNfU1RFTkNJTF9PUEZST05UID0gJ3N0ZW5jaWwub3BGcm9udCdcbnZhciBTX1NURU5DSUxfT1BCQUNLID0gJ3N0ZW5jaWwub3BCYWNrJ1xudmFyIFNfU0NJU1NPUl9FTkFCTEUgPSAnc2Npc3Nvci5lbmFibGUnXG52YXIgU19TQ0lTU09SX0JPWCA9ICdzY2lzc29yLmJveCdcbnZhciBTX1ZJRVdQT1JUID0gJ3ZpZXdwb3J0J1xuXG52YXIgU19QUk9GSUxFID0gJ3Byb2ZpbGUnXG5cbnZhciBTX0ZSQU1FQlVGRkVSID0gJ2ZyYW1lYnVmZmVyJ1xudmFyIFNfVkVSVCA9ICd2ZXJ0J1xudmFyIFNfRlJBRyA9ICdmcmFnJ1xudmFyIFNfRUxFTUVOVFMgPSAnZWxlbWVudHMnXG52YXIgU19QUklNSVRJVkUgPSAncHJpbWl0aXZlJ1xudmFyIFNfQ09VTlQgPSAnY291bnQnXG52YXIgU19PRkZTRVQgPSAnb2Zmc2V0J1xudmFyIFNfSU5TVEFOQ0VTID0gJ2luc3RhbmNlcydcblxudmFyIFNVRkZJWF9XSURUSCA9ICdXaWR0aCdcbnZhciBTVUZGSVhfSEVJR0hUID0gJ0hlaWdodCdcblxudmFyIFNfRlJBTUVCVUZGRVJfV0lEVEggPSBTX0ZSQU1FQlVGRkVSICsgU1VGRklYX1dJRFRIXG52YXIgU19GUkFNRUJVRkZFUl9IRUlHSFQgPSBTX0ZSQU1FQlVGRkVSICsgU1VGRklYX0hFSUdIVFxudmFyIFNfVklFV1BPUlRfV0lEVEggPSBTX1ZJRVdQT1JUICsgU1VGRklYX1dJRFRIXG52YXIgU19WSUVXUE9SVF9IRUlHSFQgPSBTX1ZJRVdQT1JUICsgU1VGRklYX0hFSUdIVFxudmFyIFNfRFJBV0lOR0JVRkZFUiA9ICdkcmF3aW5nQnVmZmVyJ1xudmFyIFNfRFJBV0lOR0JVRkZFUl9XSURUSCA9IFNfRFJBV0lOR0JVRkZFUiArIFNVRkZJWF9XSURUSFxudmFyIFNfRFJBV0lOR0JVRkZFUl9IRUlHSFQgPSBTX0RSQVdJTkdCVUZGRVIgKyBTVUZGSVhfSEVJR0hUXG5cbnZhciBORVNURURfT1BUSU9OUyA9IFtcbiAgU19CTEVORF9GVU5DLFxuICBTX0JMRU5EX0VRVUFUSU9OLFxuICBTX1NURU5DSUxfRlVOQyxcbiAgU19TVEVOQ0lMX09QRlJPTlQsXG4gIFNfU1RFTkNJTF9PUEJBQ0ssXG4gIFNfU0FNUExFX0NPVkVSQUdFLFxuICBTX1ZJRVdQT1JULFxuICBTX1NDSVNTT1JfQk9YLFxuICBTX1BPTFlHT05fT0ZGU0VUX09GRlNFVFxuXVxuXG52YXIgR0xfQVJSQVlfQlVGRkVSID0gMzQ5NjJcbnZhciBHTF9FTEVNRU5UX0FSUkFZX0JVRkZFUiA9IDM0OTYzXG5cbnZhciBHTF9GUkFHTUVOVF9TSEFERVIgPSAzNTYzMlxudmFyIEdMX1ZFUlRFWF9TSEFERVIgPSAzNTYzM1xuXG52YXIgR0xfVEVYVFVSRV8yRCA9IDB4MERFMVxudmFyIEdMX1RFWFRVUkVfQ1VCRV9NQVAgPSAweDg1MTNcblxudmFyIEdMX0NVTExfRkFDRSA9IDB4MEI0NFxudmFyIEdMX0JMRU5EID0gMHgwQkUyXG52YXIgR0xfRElUSEVSID0gMHgwQkQwXG52YXIgR0xfU1RFTkNJTF9URVNUID0gMHgwQjkwXG52YXIgR0xfREVQVEhfVEVTVCA9IDB4MEI3MVxudmFyIEdMX1NDSVNTT1JfVEVTVCA9IDB4MEMxMVxudmFyIEdMX1BPTFlHT05fT0ZGU0VUX0ZJTEwgPSAweDgwMzdcbnZhciBHTF9TQU1QTEVfQUxQSEFfVE9fQ09WRVJBR0UgPSAweDgwOUVcbnZhciBHTF9TQU1QTEVfQ09WRVJBR0UgPSAweDgwQTBcblxudmFyIEdMX0ZMT0FUID0gNTEyNlxudmFyIEdMX0ZMT0FUX1ZFQzIgPSAzNTY2NFxudmFyIEdMX0ZMT0FUX1ZFQzMgPSAzNTY2NVxudmFyIEdMX0ZMT0FUX1ZFQzQgPSAzNTY2NlxudmFyIEdMX0lOVCA9IDUxMjRcbnZhciBHTF9JTlRfVkVDMiA9IDM1NjY3XG52YXIgR0xfSU5UX1ZFQzMgPSAzNTY2OFxudmFyIEdMX0lOVF9WRUM0ID0gMzU2NjlcbnZhciBHTF9CT09MID0gMzU2NzBcbnZhciBHTF9CT09MX1ZFQzIgPSAzNTY3MVxudmFyIEdMX0JPT0xfVkVDMyA9IDM1NjcyXG52YXIgR0xfQk9PTF9WRUM0ID0gMzU2NzNcbnZhciBHTF9GTE9BVF9NQVQyID0gMzU2NzRcbnZhciBHTF9GTE9BVF9NQVQzID0gMzU2NzVcbnZhciBHTF9GTE9BVF9NQVQ0ID0gMzU2NzZcbnZhciBHTF9TQU1QTEVSXzJEID0gMzU2NzhcbnZhciBHTF9TQU1QTEVSX0NVQkUgPSAzNTY4MFxuXG52YXIgR0xfVFJJQU5HTEVTID0gNFxuXG52YXIgR0xfRlJPTlQgPSAxMDI4XG52YXIgR0xfQkFDSyA9IDEwMjlcbnZhciBHTF9DVyA9IDB4MDkwMFxudmFyIEdMX0NDVyA9IDB4MDkwMVxudmFyIEdMX01JTl9FWFQgPSAweDgwMDdcbnZhciBHTF9NQVhfRVhUID0gMHg4MDA4XG52YXIgR0xfQUxXQVlTID0gNTE5XG52YXIgR0xfS0VFUCA9IDc2ODBcbnZhciBHTF9aRVJPID0gMFxudmFyIEdMX09ORSA9IDFcbnZhciBHTF9GVU5DX0FERCA9IDB4ODAwNlxudmFyIEdMX0xFU1MgPSA1MTNcblxudmFyIEdMX0ZSQU1FQlVGRkVSID0gMHg4RDQwXG52YXIgR0xfQ09MT1JfQVRUQUNITUVOVDAgPSAweDhDRTBcblxudmFyIGJsZW5kRnVuY3MgPSB7XG4gICcwJzogMCxcbiAgJzEnOiAxLFxuICAnemVybyc6IDAsXG4gICdvbmUnOiAxLFxuICAnc3JjIGNvbG9yJzogNzY4LFxuICAnb25lIG1pbnVzIHNyYyBjb2xvcic6IDc2OSxcbiAgJ3NyYyBhbHBoYSc6IDc3MCxcbiAgJ29uZSBtaW51cyBzcmMgYWxwaGEnOiA3NzEsXG4gICdkc3QgY29sb3InOiA3NzQsXG4gICdvbmUgbWludXMgZHN0IGNvbG9yJzogNzc1LFxuICAnZHN0IGFscGhhJzogNzcyLFxuICAnb25lIG1pbnVzIGRzdCBhbHBoYSc6IDc3MyxcbiAgJ2NvbnN0YW50IGNvbG9yJzogMzI3NjksXG4gICdvbmUgbWludXMgY29uc3RhbnQgY29sb3InOiAzMjc3MCxcbiAgJ2NvbnN0YW50IGFscGhhJzogMzI3NzEsXG4gICdvbmUgbWludXMgY29uc3RhbnQgYWxwaGEnOiAzMjc3MixcbiAgJ3NyYyBhbHBoYSBzYXR1cmF0ZSc6IDc3NlxufVxuXG4vLyBUaGVyZSBhcmUgaW52YWxpZCB2YWx1ZXMgZm9yIHNyY1JHQiBhbmQgZHN0UkdCLiBTZWU6XG4vLyBodHRwczovL3d3dy5raHJvbm9zLm9yZy9yZWdpc3RyeS93ZWJnbC9zcGVjcy8xLjAvIzYuMTNcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvV2ViR0wvYmxvYi8wZDMyMDFmNWY3ZWMzYzAwNjBiYzFmMDQwNzc0NjE1NDFmMTk4N2I5L2NvbmZvcm1hbmNlLXN1aXRlcy8xLjAuMy9jb25mb3JtYW5jZS9taXNjL3dlYmdsLXNwZWNpZmljLmh0bWwjTDU2XG52YXIgaW52YWxpZEJsZW5kQ29tYmluYXRpb25zID0gW1xuICAnY29uc3RhbnQgY29sb3IsIGNvbnN0YW50IGFscGhhJyxcbiAgJ29uZSBtaW51cyBjb25zdGFudCBjb2xvciwgY29uc3RhbnQgYWxwaGEnLFxuICAnY29uc3RhbnQgY29sb3IsIG9uZSBtaW51cyBjb25zdGFudCBhbHBoYScsXG4gICdvbmUgbWludXMgY29uc3RhbnQgY29sb3IsIG9uZSBtaW51cyBjb25zdGFudCBhbHBoYScsXG4gICdjb25zdGFudCBhbHBoYSwgY29uc3RhbnQgY29sb3InLFxuICAnY29uc3RhbnQgYWxwaGEsIG9uZSBtaW51cyBjb25zdGFudCBjb2xvcicsXG4gICdvbmUgbWludXMgY29uc3RhbnQgYWxwaGEsIGNvbnN0YW50IGNvbG9yJyxcbiAgJ29uZSBtaW51cyBjb25zdGFudCBhbHBoYSwgb25lIG1pbnVzIGNvbnN0YW50IGNvbG9yJ1xuXVxuXG52YXIgY29tcGFyZUZ1bmNzID0ge1xuICAnbmV2ZXInOiA1MTIsXG4gICdsZXNzJzogNTEzLFxuICAnPCc6IDUxMyxcbiAgJ2VxdWFsJzogNTE0LFxuICAnPSc6IDUxNCxcbiAgJz09JzogNTE0LFxuICAnPT09JzogNTE0LFxuICAnbGVxdWFsJzogNTE1LFxuICAnPD0nOiA1MTUsXG4gICdncmVhdGVyJzogNTE2LFxuICAnPic6IDUxNixcbiAgJ25vdGVxdWFsJzogNTE3LFxuICAnIT0nOiA1MTcsXG4gICchPT0nOiA1MTcsXG4gICdnZXF1YWwnOiA1MTgsXG4gICc+PSc6IDUxOCxcbiAgJ2Fsd2F5cyc6IDUxOVxufVxuXG52YXIgc3RlbmNpbE9wcyA9IHtcbiAgJzAnOiAwLFxuICAnemVybyc6IDAsXG4gICdrZWVwJzogNzY4MCxcbiAgJ3JlcGxhY2UnOiA3NjgxLFxuICAnaW5jcmVtZW50JzogNzY4MixcbiAgJ2RlY3JlbWVudCc6IDc2ODMsXG4gICdpbmNyZW1lbnQgd3JhcCc6IDM0MDU1LFxuICAnZGVjcmVtZW50IHdyYXAnOiAzNDA1NixcbiAgJ2ludmVydCc6IDUzODZcbn1cblxudmFyIHNoYWRlclR5cGUgPSB7XG4gICdmcmFnJzogR0xfRlJBR01FTlRfU0hBREVSLFxuICAndmVydCc6IEdMX1ZFUlRFWF9TSEFERVJcbn1cblxudmFyIG9yaWVudGF0aW9uVHlwZSA9IHtcbiAgJ2N3JzogR0xfQ1csXG4gICdjY3cnOiBHTF9DQ1dcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXJBcmdzICh4KSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHgpIHx8XG4gICAgaXNUeXBlZEFycmF5KHgpIHx8XG4gICAgaXNOREFycmF5KHgpXG59XG5cbi8vIE1ha2Ugc3VyZSB2aWV3cG9ydCBpcyBwcm9jZXNzZWQgZmlyc3RcbmZ1bmN0aW9uIHNvcnRTdGF0ZSAoc3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoYSA9PT0gU19WSUVXUE9SVCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfSBlbHNlIGlmIChiID09PSBTX1ZJRVdQT1JUKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH1cbiAgICByZXR1cm4gKGEgPCBiKSA/IC0xIDogMVxuICB9KVxufVxuXG5mdW5jdGlvbiBEZWNsYXJhdGlvbiAodGhpc0RlcCwgY29udGV4dERlcCwgcHJvcERlcCwgYXBwZW5kKSB7XG4gIHRoaXMudGhpc0RlcCA9IHRoaXNEZXBcbiAgdGhpcy5jb250ZXh0RGVwID0gY29udGV4dERlcFxuICB0aGlzLnByb3BEZXAgPSBwcm9wRGVwXG4gIHRoaXMuYXBwZW5kID0gYXBwZW5kXG59XG5cbmZ1bmN0aW9uIGlzU3RhdGljIChkZWNsKSB7XG4gIHJldHVybiBkZWNsICYmICEoZGVjbC50aGlzRGVwIHx8IGRlY2wuY29udGV4dERlcCB8fCBkZWNsLnByb3BEZXApXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0YXRpY0RlY2wgKGFwcGVuZCkge1xuICByZXR1cm4gbmV3IERlY2xhcmF0aW9uKGZhbHNlLCBmYWxzZSwgZmFsc2UsIGFwcGVuZClcbn1cblxuZnVuY3Rpb24gY3JlYXRlRHluYW1pY0RlY2wgKGR5biwgYXBwZW5kKSB7XG4gIHZhciB0eXBlID0gZHluLnR5cGVcbiAgaWYgKHR5cGUgPT09IERZTl9GVU5DKSB7XG4gICAgdmFyIG51bUFyZ3MgPSBkeW4uZGF0YS5sZW5ndGhcbiAgICByZXR1cm4gbmV3IERlY2xhcmF0aW9uKFxuICAgICAgdHJ1ZSxcbiAgICAgIG51bUFyZ3MgPj0gMSxcbiAgICAgIG51bUFyZ3MgPj0gMixcbiAgICAgIGFwcGVuZClcbiAgfSBlbHNlIGlmICh0eXBlID09PSBEWU5fVEhVTkspIHtcbiAgICB2YXIgZGF0YSA9IGR5bi5kYXRhXG4gICAgcmV0dXJuIG5ldyBEZWNsYXJhdGlvbihcbiAgICAgIGRhdGEudGhpc0RlcCxcbiAgICAgIGRhdGEuY29udGV4dERlcCxcbiAgICAgIGRhdGEucHJvcERlcCxcbiAgICAgIGFwcGVuZClcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IERlY2xhcmF0aW9uKFxuICAgICAgdHlwZSA9PT0gRFlOX1NUQVRFLFxuICAgICAgdHlwZSA9PT0gRFlOX0NPTlRFWFQsXG4gICAgICB0eXBlID09PSBEWU5fUFJPUCxcbiAgICAgIGFwcGVuZClcbiAgfVxufVxuXG52YXIgU0NPUEVfREVDTCA9IG5ldyBEZWNsYXJhdGlvbihmYWxzZSwgZmFsc2UsIGZhbHNlLCBmdW5jdGlvbiAoKSB7fSlcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZWdsQ29yZSAoXG4gIGdsLFxuICBzdHJpbmdTdG9yZSxcbiAgZXh0ZW5zaW9ucyxcbiAgbGltaXRzLFxuICBidWZmZXJTdGF0ZSxcbiAgZWxlbWVudFN0YXRlLFxuICB0ZXh0dXJlU3RhdGUsXG4gIGZyYW1lYnVmZmVyU3RhdGUsXG4gIHVuaWZvcm1TdGF0ZSxcbiAgYXR0cmlidXRlU3RhdGUsXG4gIHNoYWRlclN0YXRlLFxuICBkcmF3U3RhdGUsXG4gIGNvbnRleHRTdGF0ZSxcbiAgdGltZXIsXG4gIGNvbmZpZykge1xuICB2YXIgQXR0cmlidXRlUmVjb3JkID0gYXR0cmlidXRlU3RhdGUuUmVjb3JkXG5cbiAgdmFyIGJsZW5kRXF1YXRpb25zID0ge1xuICAgICdhZGQnOiAzMjc3NCxcbiAgICAnc3VidHJhY3QnOiAzMjc3OCxcbiAgICAncmV2ZXJzZSBzdWJ0cmFjdCc6IDMyNzc5XG4gIH1cbiAgaWYgKGV4dGVuc2lvbnMuZXh0X2JsZW5kX21pbm1heCkge1xuICAgIGJsZW5kRXF1YXRpb25zLm1pbiA9IEdMX01JTl9FWFRcbiAgICBibGVuZEVxdWF0aW9ucy5tYXggPSBHTF9NQVhfRVhUXG4gIH1cblxuICB2YXIgZXh0SW5zdGFuY2luZyA9IGV4dGVuc2lvbnMuYW5nbGVfaW5zdGFuY2VkX2FycmF5c1xuICB2YXIgZXh0RHJhd0J1ZmZlcnMgPSBleHRlbnNpb25zLndlYmdsX2RyYXdfYnVmZmVyc1xuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gV0VCR0wgU1RBVEVcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICB2YXIgY3VycmVudFN0YXRlID0ge1xuICAgIGRpcnR5OiB0cnVlLFxuICAgIHByb2ZpbGU6IGNvbmZpZy5wcm9maWxlXG4gIH1cbiAgdmFyIG5leHRTdGF0ZSA9IHt9XG4gIHZhciBHTF9TVEFURV9OQU1FUyA9IFtdXG4gIHZhciBHTF9GTEFHUyA9IHt9XG4gIHZhciBHTF9WQVJJQUJMRVMgPSB7fVxuXG4gIGZ1bmN0aW9uIHByb3BOYW1lIChuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWUucmVwbGFjZSgnLicsICdfJylcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXRlRmxhZyAoc25hbWUsIGNhcCwgaW5pdCkge1xuICAgIHZhciBuYW1lID0gcHJvcE5hbWUoc25hbWUpXG4gICAgR0xfU1RBVEVfTkFNRVMucHVzaChzbmFtZSlcbiAgICBuZXh0U3RhdGVbbmFtZV0gPSBjdXJyZW50U3RhdGVbbmFtZV0gPSAhIWluaXRcbiAgICBHTF9GTEFHU1tuYW1lXSA9IGNhcFxuICB9XG5cbiAgZnVuY3Rpb24gc3RhdGVWYXJpYWJsZSAoc25hbWUsIGZ1bmMsIGluaXQpIHtcbiAgICB2YXIgbmFtZSA9IHByb3BOYW1lKHNuYW1lKVxuICAgIEdMX1NUQVRFX05BTUVTLnB1c2goc25hbWUpXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5pdCkpIHtcbiAgICAgIGN1cnJlbnRTdGF0ZVtuYW1lXSA9IGluaXQuc2xpY2UoKVxuICAgICAgbmV4dFN0YXRlW25hbWVdID0gaW5pdC5zbGljZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnRTdGF0ZVtuYW1lXSA9IG5leHRTdGF0ZVtuYW1lXSA9IGluaXRcbiAgICB9XG4gICAgR0xfVkFSSUFCTEVTW25hbWVdID0gZnVuY1xuICB9XG5cbiAgLy8gRGl0aGVyaW5nXG4gIHN0YXRlRmxhZyhTX0RJVEhFUiwgR0xfRElUSEVSKVxuXG4gIC8vIEJsZW5kaW5nXG4gIHN0YXRlRmxhZyhTX0JMRU5EX0VOQUJMRSwgR0xfQkxFTkQpXG4gIHN0YXRlVmFyaWFibGUoU19CTEVORF9DT0xPUiwgJ2JsZW5kQ29sb3InLCBbMCwgMCwgMCwgMF0pXG4gIHN0YXRlVmFyaWFibGUoU19CTEVORF9FUVVBVElPTiwgJ2JsZW5kRXF1YXRpb25TZXBhcmF0ZScsXG4gICAgW0dMX0ZVTkNfQURELCBHTF9GVU5DX0FERF0pXG4gIHN0YXRlVmFyaWFibGUoU19CTEVORF9GVU5DLCAnYmxlbmRGdW5jU2VwYXJhdGUnLFxuICAgIFtHTF9PTkUsIEdMX1pFUk8sIEdMX09ORSwgR0xfWkVST10pXG5cbiAgLy8gRGVwdGhcbiAgc3RhdGVGbGFnKFNfREVQVEhfRU5BQkxFLCBHTF9ERVBUSF9URVNULCB0cnVlKVxuICBzdGF0ZVZhcmlhYmxlKFNfREVQVEhfRlVOQywgJ2RlcHRoRnVuYycsIEdMX0xFU1MpXG4gIHN0YXRlVmFyaWFibGUoU19ERVBUSF9SQU5HRSwgJ2RlcHRoUmFuZ2UnLCBbMCwgMV0pXG4gIHN0YXRlVmFyaWFibGUoU19ERVBUSF9NQVNLLCAnZGVwdGhNYXNrJywgdHJ1ZSlcblxuICAvLyBDb2xvciBtYXNrXG4gIHN0YXRlVmFyaWFibGUoU19DT0xPUl9NQVNLLCBTX0NPTE9SX01BU0ssIFt0cnVlLCB0cnVlLCB0cnVlLCB0cnVlXSlcblxuICAvLyBGYWNlIGN1bGxpbmdcbiAgc3RhdGVGbGFnKFNfQ1VMTF9FTkFCTEUsIEdMX0NVTExfRkFDRSlcbiAgc3RhdGVWYXJpYWJsZShTX0NVTExfRkFDRSwgJ2N1bGxGYWNlJywgR0xfQkFDSylcblxuICAvLyBGcm9udCBmYWNlIG9yaWVudGF0aW9uXG4gIHN0YXRlVmFyaWFibGUoU19GUk9OVF9GQUNFLCBTX0ZST05UX0ZBQ0UsIEdMX0NDVylcblxuICAvLyBMaW5lIHdpZHRoXG4gIHN0YXRlVmFyaWFibGUoU19MSU5FX1dJRFRILCBTX0xJTkVfV0lEVEgsIDEpXG5cbiAgLy8gUG9seWdvbiBvZmZzZXRcbiAgc3RhdGVGbGFnKFNfUE9MWUdPTl9PRkZTRVRfRU5BQkxFLCBHTF9QT0xZR09OX09GRlNFVF9GSUxMKVxuICBzdGF0ZVZhcmlhYmxlKFNfUE9MWUdPTl9PRkZTRVRfT0ZGU0VULCAncG9seWdvbk9mZnNldCcsIFswLCAwXSlcblxuICAvLyBTYW1wbGUgY292ZXJhZ2VcbiAgc3RhdGVGbGFnKFNfU0FNUExFX0FMUEhBLCBHTF9TQU1QTEVfQUxQSEFfVE9fQ09WRVJBR0UpXG4gIHN0YXRlRmxhZyhTX1NBTVBMRV9FTkFCTEUsIEdMX1NBTVBMRV9DT1ZFUkFHRSlcbiAgc3RhdGVWYXJpYWJsZShTX1NBTVBMRV9DT1ZFUkFHRSwgJ3NhbXBsZUNvdmVyYWdlJywgWzEsIGZhbHNlXSlcblxuICAvLyBTdGVuY2lsXG4gIHN0YXRlRmxhZyhTX1NURU5DSUxfRU5BQkxFLCBHTF9TVEVOQ0lMX1RFU1QpXG4gIHN0YXRlVmFyaWFibGUoU19TVEVOQ0lMX01BU0ssICdzdGVuY2lsTWFzaycsIC0xKVxuICBzdGF0ZVZhcmlhYmxlKFNfU1RFTkNJTF9GVU5DLCAnc3RlbmNpbEZ1bmMnLCBbR0xfQUxXQVlTLCAwLCAtMV0pXG4gIHN0YXRlVmFyaWFibGUoU19TVEVOQ0lMX09QRlJPTlQsICdzdGVuY2lsT3BTZXBhcmF0ZScsXG4gICAgW0dMX0ZST05ULCBHTF9LRUVQLCBHTF9LRUVQLCBHTF9LRUVQXSlcbiAgc3RhdGVWYXJpYWJsZShTX1NURU5DSUxfT1BCQUNLLCAnc3RlbmNpbE9wU2VwYXJhdGUnLFxuICAgIFtHTF9CQUNLLCBHTF9LRUVQLCBHTF9LRUVQLCBHTF9LRUVQXSlcblxuICAvLyBTY2lzc29yXG4gIHN0YXRlRmxhZyhTX1NDSVNTT1JfRU5BQkxFLCBHTF9TQ0lTU09SX1RFU1QpXG4gIHN0YXRlVmFyaWFibGUoU19TQ0lTU09SX0JPWCwgJ3NjaXNzb3InLFxuICAgIFswLCAwLCBnbC5kcmF3aW5nQnVmZmVyV2lkdGgsIGdsLmRyYXdpbmdCdWZmZXJIZWlnaHRdKVxuXG4gIC8vIFZpZXdwb3J0XG4gIHN0YXRlVmFyaWFibGUoU19WSUVXUE9SVCwgU19WSUVXUE9SVCxcbiAgICBbMCwgMCwgZ2wuZHJhd2luZ0J1ZmZlcldpZHRoLCBnbC5kcmF3aW5nQnVmZmVySGVpZ2h0XSlcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIEVOVklST05NRU5UXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgdmFyIHNoYXJlZFN0YXRlID0ge1xuICAgIGdsOiBnbCxcbiAgICBjb250ZXh0OiBjb250ZXh0U3RhdGUsXG4gICAgc3RyaW5nczogc3RyaW5nU3RvcmUsXG4gICAgbmV4dDogbmV4dFN0YXRlLFxuICAgIGN1cnJlbnQ6IGN1cnJlbnRTdGF0ZSxcbiAgICBkcmF3OiBkcmF3U3RhdGUsXG4gICAgZWxlbWVudHM6IGVsZW1lbnRTdGF0ZSxcbiAgICBidWZmZXI6IGJ1ZmZlclN0YXRlLFxuICAgIHNoYWRlcjogc2hhZGVyU3RhdGUsXG4gICAgYXR0cmlidXRlczogYXR0cmlidXRlU3RhdGUuc3RhdGUsXG4gICAgdW5pZm9ybXM6IHVuaWZvcm1TdGF0ZSxcbiAgICBmcmFtZWJ1ZmZlcjogZnJhbWVidWZmZXJTdGF0ZSxcbiAgICBleHRlbnNpb25zOiBleHRlbnNpb25zLFxuXG4gICAgdGltZXI6IHRpbWVyLFxuICAgIGlzQnVmZmVyQXJnczogaXNCdWZmZXJBcmdzXG4gIH1cblxuICB2YXIgc2hhcmVkQ29uc3RhbnRzID0ge1xuICAgIHByaW1UeXBlczogcHJpbVR5cGVzLFxuICAgIGNvbXBhcmVGdW5jczogY29tcGFyZUZ1bmNzLFxuICAgIGJsZW5kRnVuY3M6IGJsZW5kRnVuY3MsXG4gICAgYmxlbmRFcXVhdGlvbnM6IGJsZW5kRXF1YXRpb25zLFxuICAgIHN0ZW5jaWxPcHM6IHN0ZW5jaWxPcHMsXG4gICAgZ2xUeXBlczogZ2xUeXBlcyxcbiAgICBvcmllbnRhdGlvblR5cGU6IG9yaWVudGF0aW9uVHlwZVxuICB9XG5cbiAgXG5cbiAgaWYgKGV4dERyYXdCdWZmZXJzKSB7XG4gICAgc2hhcmVkQ29uc3RhbnRzLmJhY2tCdWZmZXIgPSBbR0xfQkFDS11cbiAgICBzaGFyZWRDb25zdGFudHMuZHJhd0J1ZmZlciA9IGxvb3AobGltaXRzLm1heERyYXdidWZmZXJzLCBmdW5jdGlvbiAoaSkge1xuICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFswXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGxvb3AoaSwgZnVuY3Rpb24gKGopIHtcbiAgICAgICAgcmV0dXJuIEdMX0NPTE9SX0FUVEFDSE1FTlQwICsgalxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgdmFyIGRyYXdDYWxsQ291bnRlciA9IDBcbiAgZnVuY3Rpb24gY3JlYXRlUkVHTEVudmlyb25tZW50ICgpIHtcbiAgICB2YXIgZW52ID0gY3JlYXRlRW52aXJvbm1lbnQoKVxuICAgIHZhciBsaW5rID0gZW52LmxpbmtcbiAgICB2YXIgZ2xvYmFsID0gZW52Lmdsb2JhbFxuICAgIGVudi5pZCA9IGRyYXdDYWxsQ291bnRlcisrXG5cbiAgICBlbnYuYmF0Y2hJZCA9ICcwJ1xuXG4gICAgLy8gbGluayBzaGFyZWQgc3RhdGVcbiAgICB2YXIgU0hBUkVEID0gbGluayhzaGFyZWRTdGF0ZSlcbiAgICB2YXIgc2hhcmVkID0gZW52LnNoYXJlZCA9IHtcbiAgICAgIHByb3BzOiAnYTAnXG4gICAgfVxuICAgIE9iamVjdC5rZXlzKHNoYXJlZFN0YXRlKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICBzaGFyZWRbcHJvcF0gPSBnbG9iYWwuZGVmKFNIQVJFRCwgJy4nLCBwcm9wKVxuICAgIH0pXG5cbiAgICAvLyBJbmplY3QgcnVudGltZSBhc3NlcnRpb24gc3R1ZmYgZm9yIGRlYnVnIGJ1aWxkc1xuICAgIFxuXG4gICAgLy8gQ29weSBHTCBzdGF0ZSB2YXJpYWJsZXMgb3ZlclxuICAgIHZhciBuZXh0VmFycyA9IGVudi5uZXh0ID0ge31cbiAgICB2YXIgY3VycmVudFZhcnMgPSBlbnYuY3VycmVudCA9IHt9XG4gICAgT2JqZWN0LmtleXMoR0xfVkFSSUFCTEVTKS5mb3JFYWNoKGZ1bmN0aW9uICh2YXJpYWJsZSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VycmVudFN0YXRlW3ZhcmlhYmxlXSkpIHtcbiAgICAgICAgbmV4dFZhcnNbdmFyaWFibGVdID0gZ2xvYmFsLmRlZihzaGFyZWQubmV4dCwgJy4nLCB2YXJpYWJsZSlcbiAgICAgICAgY3VycmVudFZhcnNbdmFyaWFibGVdID0gZ2xvYmFsLmRlZihzaGFyZWQuY3VycmVudCwgJy4nLCB2YXJpYWJsZSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gSW5pdGlhbGl6ZSBzaGFyZWQgY29uc3RhbnRzXG4gICAgdmFyIGNvbnN0YW50cyA9IGVudi5jb25zdGFudHMgPSB7fVxuICAgIE9iamVjdC5rZXlzKHNoYXJlZENvbnN0YW50cykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgY29uc3RhbnRzW25hbWVdID0gZ2xvYmFsLmRlZihKU09OLnN0cmluZ2lmeShzaGFyZWRDb25zdGFudHNbbmFtZV0pKVxuICAgIH0pXG5cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gZm9yIGNhbGxpbmcgYSBibG9ja1xuICAgIGVudi5pbnZva2UgPSBmdW5jdGlvbiAoYmxvY2ssIHgpIHtcbiAgICAgIHN3aXRjaCAoeC50eXBlKSB7XG4gICAgICAgIGNhc2UgRFlOX0ZVTkM6XG4gICAgICAgICAgdmFyIGFyZ0xpc3QgPSBbXG4gICAgICAgICAgICAndGhpcycsXG4gICAgICAgICAgICBzaGFyZWQuY29udGV4dCxcbiAgICAgICAgICAgIHNoYXJlZC5wcm9wcyxcbiAgICAgICAgICAgIGVudi5iYXRjaElkXG4gICAgICAgICAgXVxuICAgICAgICAgIHJldHVybiBibG9jay5kZWYoXG4gICAgICAgICAgICBsaW5rKHguZGF0YSksICcuY2FsbCgnLFxuICAgICAgICAgICAgICBhcmdMaXN0LnNsaWNlKDAsIE1hdGgubWF4KHguZGF0YS5sZW5ndGggKyAxLCA0KSksXG4gICAgICAgICAgICAgJyknKVxuICAgICAgICBjYXNlIERZTl9QUk9QOlxuICAgICAgICAgIHJldHVybiBibG9jay5kZWYoc2hhcmVkLnByb3BzLCB4LmRhdGEpXG4gICAgICAgIGNhc2UgRFlOX0NPTlRFWFQ6XG4gICAgICAgICAgcmV0dXJuIGJsb2NrLmRlZihzaGFyZWQuY29udGV4dCwgeC5kYXRhKVxuICAgICAgICBjYXNlIERZTl9TVEFURTpcbiAgICAgICAgICByZXR1cm4gYmxvY2suZGVmKCd0aGlzJywgeC5kYXRhKVxuICAgICAgICBjYXNlIERZTl9USFVOSzpcbiAgICAgICAgICB4LmRhdGEuYXBwZW5kKGVudiwgYmxvY2spXG4gICAgICAgICAgcmV0dXJuIHguZGF0YS5yZWZcbiAgICAgIH1cbiAgICB9XG5cbiAgICBlbnYuYXR0cmliQ2FjaGUgPSB7fVxuXG4gICAgdmFyIHNjb3BlQXR0cmlicyA9IHt9XG4gICAgZW52LnNjb3BlQXR0cmliID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciBpZCA9IHN0cmluZ1N0b3JlLmlkKG5hbWUpXG4gICAgICBpZiAoaWQgaW4gc2NvcGVBdHRyaWJzKSB7XG4gICAgICAgIHJldHVybiBzY29wZUF0dHJpYnNbaWRdXG4gICAgICB9XG4gICAgICB2YXIgYmluZGluZyA9IGF0dHJpYnV0ZVN0YXRlLnNjb3BlW2lkXVxuICAgICAgaWYgKCFiaW5kaW5nKSB7XG4gICAgICAgIGJpbmRpbmcgPSBhdHRyaWJ1dGVTdGF0ZS5zY29wZVtpZF0gPSBuZXcgQXR0cmlidXRlUmVjb3JkKClcbiAgICAgIH1cbiAgICAgIHZhciByZXN1bHQgPSBzY29wZUF0dHJpYnNbaWRdID0gbGluayhiaW5kaW5nKVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cblxuICAgIHJldHVybiBlbnZcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gUEFSU0lOR1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGZ1bmN0aW9uIHBhcnNlUHJvZmlsZSAob3B0aW9ucykge1xuICAgIHZhciBzdGF0aWNPcHRpb25zID0gb3B0aW9ucy5zdGF0aWNcbiAgICB2YXIgZHluYW1pY09wdGlvbnMgPSBvcHRpb25zLmR5bmFtaWNcblxuICAgIHZhciBwcm9maWxlRW5hYmxlXG4gICAgaWYgKFNfUFJPRklMRSBpbiBzdGF0aWNPcHRpb25zKSB7XG4gICAgICB2YXIgdmFsdWUgPSAhIXN0YXRpY09wdGlvbnNbU19QUk9GSUxFXVxuICAgICAgcHJvZmlsZUVuYWJsZSA9IGNyZWF0ZVN0YXRpY0RlY2woZnVuY3Rpb24gKGVudiwgc2NvcGUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICB9KVxuICAgICAgcHJvZmlsZUVuYWJsZS5lbmFibGUgPSB2YWx1ZVxuICAgIH0gZWxzZSBpZiAoU19QUk9GSUxFIGluIGR5bmFtaWNPcHRpb25zKSB7XG4gICAgICB2YXIgZHluID0gZHluYW1pY09wdGlvbnNbU19QUk9GSUxFXVxuICAgICAgcHJvZmlsZUVuYWJsZSA9IGNyZWF0ZUR5bmFtaWNEZWNsKGR5biwgZnVuY3Rpb24gKGVudiwgc2NvcGUpIHtcbiAgICAgICAgcmV0dXJuIGVudi5pbnZva2Uoc2NvcGUsIGR5bilcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2ZpbGVFbmFibGVcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlRnJhbWVidWZmZXIgKG9wdGlvbnMsIGVudikge1xuICAgIHZhciBzdGF0aWNPcHRpb25zID0gb3B0aW9ucy5zdGF0aWNcbiAgICB2YXIgZHluYW1pY09wdGlvbnMgPSBvcHRpb25zLmR5bmFtaWNcblxuICAgIGlmIChTX0ZSQU1FQlVGRkVSIGluIHN0YXRpY09wdGlvbnMpIHtcbiAgICAgIHZhciBmcmFtZWJ1ZmZlciA9IHN0YXRpY09wdGlvbnNbU19GUkFNRUJVRkZFUl1cbiAgICAgIGlmIChmcmFtZWJ1ZmZlcikge1xuICAgICAgICBmcmFtZWJ1ZmZlciA9IGZyYW1lYnVmZmVyU3RhdGUuZ2V0RnJhbWVidWZmZXIoZnJhbWVidWZmZXIpXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY3JlYXRlU3RhdGljRGVjbChmdW5jdGlvbiAoZW52LCBibG9jaykge1xuICAgICAgICAgIHZhciBGUkFNRUJVRkZFUiA9IGVudi5saW5rKGZyYW1lYnVmZmVyKVxuICAgICAgICAgIHZhciBzaGFyZWQgPSBlbnYuc2hhcmVkXG4gICAgICAgICAgYmxvY2suc2V0KFxuICAgICAgICAgICAgc2hhcmVkLmZyYW1lYnVmZmVyLFxuICAgICAgICAgICAgJy5uZXh0JyxcbiAgICAgICAgICAgIEZSQU1FQlVGRkVSKVxuICAgICAgICAgIHZhciBDT05URVhUID0gc2hhcmVkLmNvbnRleHRcbiAgICAgICAgICBibG9jay5zZXQoXG4gICAgICAgICAgICBDT05URVhULFxuICAgICAgICAgICAgJy4nICsgU19GUkFNRUJVRkZFUl9XSURUSCxcbiAgICAgICAgICAgIEZSQU1FQlVGRkVSICsgJy53aWR0aCcpXG4gICAgICAgICAgYmxvY2suc2V0KFxuICAgICAgICAgICAgQ09OVEVYVCxcbiAgICAgICAgICAgICcuJyArIFNfRlJBTUVCVUZGRVJfSEVJR0hULFxuICAgICAgICAgICAgRlJBTUVCVUZGRVIgKyAnLmhlaWdodCcpXG4gICAgICAgICAgcmV0dXJuIEZSQU1FQlVGRkVSXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY3JlYXRlU3RhdGljRGVjbChmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICAgIHZhciBzaGFyZWQgPSBlbnYuc2hhcmVkXG4gICAgICAgICAgc2NvcGUuc2V0KFxuICAgICAgICAgICAgc2hhcmVkLmZyYW1lYnVmZmVyLFxuICAgICAgICAgICAgJy5uZXh0JyxcbiAgICAgICAgICAgICdudWxsJylcbiAgICAgICAgICB2YXIgQ09OVEVYVCA9IHNoYXJlZC5jb250ZXh0XG4gICAgICAgICAgc2NvcGUuc2V0KFxuICAgICAgICAgICAgQ09OVEVYVCxcbiAgICAgICAgICAgICcuJyArIFNfRlJBTUVCVUZGRVJfV0lEVEgsXG4gICAgICAgICAgICBDT05URVhUICsgJy4nICsgU19EUkFXSU5HQlVGRkVSX1dJRFRIKVxuICAgICAgICAgIHNjb3BlLnNldChcbiAgICAgICAgICAgIENPTlRFWFQsXG4gICAgICAgICAgICAnLicgKyBTX0ZSQU1FQlVGRkVSX0hFSUdIVCxcbiAgICAgICAgICAgIENPTlRFWFQgKyAnLicgKyBTX0RSQVdJTkdCVUZGRVJfSEVJR0hUKVxuICAgICAgICAgIHJldHVybiAnbnVsbCdcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFNfRlJBTUVCVUZGRVIgaW4gZHluYW1pY09wdGlvbnMpIHtcbiAgICAgIHZhciBkeW4gPSBkeW5hbWljT3B0aW9uc1tTX0ZSQU1FQlVGRkVSXVxuICAgICAgcmV0dXJuIGNyZWF0ZUR5bmFtaWNEZWNsKGR5biwgZnVuY3Rpb24gKGVudiwgc2NvcGUpIHtcbiAgICAgICAgdmFyIEZSQU1FQlVGRkVSX0ZVTkMgPSBlbnYuaW52b2tlKHNjb3BlLCBkeW4pXG4gICAgICAgIHZhciBzaGFyZWQgPSBlbnYuc2hhcmVkXG4gICAgICAgIHZhciBGUkFNRUJVRkZFUl9TVEFURSA9IHNoYXJlZC5mcmFtZWJ1ZmZlclxuICAgICAgICB2YXIgRlJBTUVCVUZGRVIgPSBzY29wZS5kZWYoXG4gICAgICAgICAgRlJBTUVCVUZGRVJfU1RBVEUsICcuZ2V0RnJhbWVidWZmZXIoJywgRlJBTUVCVUZGRVJfRlVOQywgJyknKVxuXG4gICAgICAgIFxuXG4gICAgICAgIHNjb3BlLnNldChcbiAgICAgICAgICBGUkFNRUJVRkZFUl9TVEFURSxcbiAgICAgICAgICAnLm5leHQnLFxuICAgICAgICAgIEZSQU1FQlVGRkVSKVxuICAgICAgICB2YXIgQ09OVEVYVCA9IHNoYXJlZC5jb250ZXh0XG4gICAgICAgIHNjb3BlLnNldChcbiAgICAgICAgICBDT05URVhULFxuICAgICAgICAgICcuJyArIFNfRlJBTUVCVUZGRVJfV0lEVEgsXG4gICAgICAgICAgRlJBTUVCVUZGRVIgKyAnPycgKyBGUkFNRUJVRkZFUiArICcud2lkdGg6JyArXG4gICAgICAgICAgQ09OVEVYVCArICcuJyArIFNfRFJBV0lOR0JVRkZFUl9XSURUSClcbiAgICAgICAgc2NvcGUuc2V0KFxuICAgICAgICAgIENPTlRFWFQsXG4gICAgICAgICAgJy4nICsgU19GUkFNRUJVRkZFUl9IRUlHSFQsXG4gICAgICAgICAgRlJBTUVCVUZGRVIgK1xuICAgICAgICAgICc/JyArIEZSQU1FQlVGRkVSICsgJy5oZWlnaHQ6JyArXG4gICAgICAgICAgQ09OVEVYVCArICcuJyArIFNfRFJBV0lOR0JVRkZFUl9IRUlHSFQpXG4gICAgICAgIHJldHVybiBGUkFNRUJVRkZFUlxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVZpZXdwb3J0U2Npc3NvciAob3B0aW9ucywgZnJhbWVidWZmZXIsIGVudikge1xuICAgIHZhciBzdGF0aWNPcHRpb25zID0gb3B0aW9ucy5zdGF0aWNcbiAgICB2YXIgZHluYW1pY09wdGlvbnMgPSBvcHRpb25zLmR5bmFtaWNcblxuICAgIGZ1bmN0aW9uIHBhcnNlQm94IChwYXJhbSkge1xuICAgICAgaWYgKHBhcmFtIGluIHN0YXRpY09wdGlvbnMpIHtcbiAgICAgICAgdmFyIGJveCA9IHN0YXRpY09wdGlvbnNbcGFyYW1dXG4gICAgICAgIFxuXG4gICAgICAgIHZhciBpc1N0YXRpYyA9IHRydWVcbiAgICAgICAgdmFyIHggPSBib3gueCB8IDBcbiAgICAgICAgdmFyIHkgPSBib3gueSB8IDBcbiAgICAgICAgXG4gICAgICAgIHZhciB3LCBoXG4gICAgICAgIGlmICgnd2lkdGgnIGluIGJveCkge1xuICAgICAgICAgIHcgPSBib3gud2lkdGggfCAwXG4gICAgICAgICAgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNTdGF0aWMgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIGlmICgnaGVpZ2h0JyBpbiBib3gpIHtcbiAgICAgICAgICBoID0gYm94LmhlaWdodCB8IDBcbiAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpc1N0YXRpYyA9IGZhbHNlXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IERlY2xhcmF0aW9uKFxuICAgICAgICAgICFpc1N0YXRpYyAmJiBmcmFtZWJ1ZmZlciAmJiBmcmFtZWJ1ZmZlci50aGlzRGVwLFxuICAgICAgICAgICFpc1N0YXRpYyAmJiBmcmFtZWJ1ZmZlciAmJiBmcmFtZWJ1ZmZlci5jb250ZXh0RGVwLFxuICAgICAgICAgICFpc1N0YXRpYyAmJiBmcmFtZWJ1ZmZlciAmJiBmcmFtZWJ1ZmZlci5wcm9wRGVwLFxuICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgICB2YXIgQ09OVEVYVCA9IGVudi5zaGFyZWQuY29udGV4dFxuICAgICAgICAgICAgdmFyIEJPWF9XID0gd1xuICAgICAgICAgICAgaWYgKCEoJ3dpZHRoJyBpbiBib3gpKSB7XG4gICAgICAgICAgICAgIEJPWF9XID0gc2NvcGUuZGVmKENPTlRFWFQsICcuJywgU19GUkFNRUJVRkZFUl9XSURUSCwgJy0nLCB4KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgQk9YX0ggPSBoXG4gICAgICAgICAgICBpZiAoISgnaGVpZ2h0JyBpbiBib3gpKSB7XG4gICAgICAgICAgICAgIEJPWF9IID0gc2NvcGUuZGVmKENPTlRFWFQsICcuJywgU19GUkFNRUJVRkZFUl9IRUlHSFQsICctJywgeSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFt4LCB5LCBCT1hfVywgQk9YX0hdXG4gICAgICAgICAgfSlcbiAgICAgIH0gZWxzZSBpZiAocGFyYW0gaW4gZHluYW1pY09wdGlvbnMpIHtcbiAgICAgICAgdmFyIGR5bkJveCA9IGR5bmFtaWNPcHRpb25zW3BhcmFtXVxuICAgICAgICB2YXIgcmVzdWx0ID0gY3JlYXRlRHluYW1pY0RlY2woZHluQm94LCBmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICAgIHZhciBCT1ggPSBlbnYuaW52b2tlKHNjb3BlLCBkeW5Cb3gpXG5cbiAgICAgICAgICBcblxuICAgICAgICAgIHZhciBDT05URVhUID0gZW52LnNoYXJlZC5jb250ZXh0XG4gICAgICAgICAgdmFyIEJPWF9YID0gc2NvcGUuZGVmKEJPWCwgJy54fDAnKVxuICAgICAgICAgIHZhciBCT1hfWSA9IHNjb3BlLmRlZihCT1gsICcueXwwJylcbiAgICAgICAgICB2YXIgQk9YX1cgPSBzY29wZS5kZWYoXG4gICAgICAgICAgICAnXCJ3aWR0aFwiIGluICcsIEJPWCwgJz8nLCBCT1gsICcud2lkdGh8MDonLFxuICAgICAgICAgICAgJygnLCBDT05URVhULCAnLicsIFNfRlJBTUVCVUZGRVJfV0lEVEgsICctJywgQk9YX1gsICcpJylcbiAgICAgICAgICB2YXIgQk9YX0ggPSBzY29wZS5kZWYoXG4gICAgICAgICAgICAnXCJoZWlnaHRcIiBpbiAnLCBCT1gsICc/JywgQk9YLCAnLmhlaWdodHwwOicsXG4gICAgICAgICAgICAnKCcsIENPTlRFWFQsICcuJywgU19GUkFNRUJVRkZFUl9IRUlHSFQsICctJywgQk9YX1ksICcpJylcblxuICAgICAgICAgIFxuXG4gICAgICAgICAgcmV0dXJuIFtCT1hfWCwgQk9YX1ksIEJPWF9XLCBCT1hfSF1cbiAgICAgICAgfSlcbiAgICAgICAgaWYgKGZyYW1lYnVmZmVyKSB7XG4gICAgICAgICAgcmVzdWx0LnRoaXNEZXAgPSByZXN1bHQudGhpc0RlcCB8fCBmcmFtZWJ1ZmZlci50aGlzRGVwXG4gICAgICAgICAgcmVzdWx0LmNvbnRleHREZXAgPSByZXN1bHQuY29udGV4dERlcCB8fCBmcmFtZWJ1ZmZlci5jb250ZXh0RGVwXG4gICAgICAgICAgcmVzdWx0LnByb3BEZXAgPSByZXN1bHQucHJvcERlcCB8fCBmcmFtZWJ1ZmZlci5wcm9wRGVwXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgfSBlbHNlIGlmIChmcmFtZWJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gbmV3IERlY2xhcmF0aW9uKFxuICAgICAgICAgIGZyYW1lYnVmZmVyLnRoaXNEZXAsXG4gICAgICAgICAgZnJhbWVidWZmZXIuY29udGV4dERlcCxcbiAgICAgICAgICBmcmFtZWJ1ZmZlci5wcm9wRGVwLFxuICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgICB2YXIgQ09OVEVYVCA9IGVudi5zaGFyZWQuY29udGV4dFxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgMCwgMCxcbiAgICAgICAgICAgICAgc2NvcGUuZGVmKENPTlRFWFQsICcuJywgU19GUkFNRUJVRkZFUl9XSURUSCksXG4gICAgICAgICAgICAgIHNjb3BlLmRlZihDT05URVhULCAnLicsIFNfRlJBTUVCVUZGRVJfSEVJR0hUKV1cbiAgICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdmlld3BvcnQgPSBwYXJzZUJveChTX1ZJRVdQT1JUKVxuXG4gICAgaWYgKHZpZXdwb3J0KSB7XG4gICAgICB2YXIgcHJldlZpZXdwb3J0ID0gdmlld3BvcnRcbiAgICAgIHZpZXdwb3J0ID0gbmV3IERlY2xhcmF0aW9uKFxuICAgICAgICB2aWV3cG9ydC50aGlzRGVwLFxuICAgICAgICB2aWV3cG9ydC5jb250ZXh0RGVwLFxuICAgICAgICB2aWV3cG9ydC5wcm9wRGVwLFxuICAgICAgICBmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICAgIHZhciBWSUVXUE9SVCA9IHByZXZWaWV3cG9ydC5hcHBlbmQoZW52LCBzY29wZSlcbiAgICAgICAgICB2YXIgQ09OVEVYVCA9IGVudi5zaGFyZWQuY29udGV4dFxuICAgICAgICAgIHNjb3BlLnNldChcbiAgICAgICAgICAgIENPTlRFWFQsXG4gICAgICAgICAgICAnLicgKyBTX1ZJRVdQT1JUX1dJRFRILFxuICAgICAgICAgICAgVklFV1BPUlRbMl0pXG4gICAgICAgICAgc2NvcGUuc2V0KFxuICAgICAgICAgICAgQ09OVEVYVCxcbiAgICAgICAgICAgICcuJyArIFNfVklFV1BPUlRfSEVJR0hULFxuICAgICAgICAgICAgVklFV1BPUlRbM10pXG4gICAgICAgICAgcmV0dXJuIFZJRVdQT1JUXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZpZXdwb3J0OiB2aWV3cG9ydCxcbiAgICAgIHNjaXNzb3JfYm94OiBwYXJzZUJveChTX1NDSVNTT1JfQk9YKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlUHJvZ3JhbSAob3B0aW9ucykge1xuICAgIHZhciBzdGF0aWNPcHRpb25zID0gb3B0aW9ucy5zdGF0aWNcbiAgICB2YXIgZHluYW1pY09wdGlvbnMgPSBvcHRpb25zLmR5bmFtaWNcblxuICAgIGZ1bmN0aW9uIHBhcnNlU2hhZGVyIChuYW1lKSB7XG4gICAgICBpZiAobmFtZSBpbiBzdGF0aWNPcHRpb25zKSB7XG4gICAgICAgIHZhciBpZCA9IHN0cmluZ1N0b3JlLmlkKHN0YXRpY09wdGlvbnNbbmFtZV0pXG4gICAgICAgIFxuICAgICAgICB2YXIgcmVzdWx0ID0gY3JlYXRlU3RhdGljRGVjbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGlkXG4gICAgICAgIH0pXG4gICAgICAgIHJlc3VsdC5pZCA9IGlkXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIH0gZWxzZSBpZiAobmFtZSBpbiBkeW5hbWljT3B0aW9ucykge1xuICAgICAgICB2YXIgZHluID0gZHluYW1pY09wdGlvbnNbbmFtZV1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUR5bmFtaWNEZWNsKGR5biwgZnVuY3Rpb24gKGVudiwgc2NvcGUpIHtcbiAgICAgICAgICB2YXIgc3RyID0gZW52Lmludm9rZShzY29wZSwgZHluKVxuICAgICAgICAgIHZhciBpZCA9IHNjb3BlLmRlZihlbnYuc2hhcmVkLnN0cmluZ3MsICcuaWQoJywgc3RyLCAnKScpXG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIGlkXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBmcmFnID0gcGFyc2VTaGFkZXIoU19GUkFHKVxuICAgIHZhciB2ZXJ0ID0gcGFyc2VTaGFkZXIoU19WRVJUKVxuXG4gICAgdmFyIHByb2dyYW0gPSBudWxsXG4gICAgdmFyIHByb2dWYXJcbiAgICBpZiAoaXNTdGF0aWMoZnJhZykgJiYgaXNTdGF0aWModmVydCkpIHtcbiAgICAgIHByb2dyYW0gPSBzaGFkZXJTdGF0ZS5wcm9ncmFtKHZlcnQuaWQsIGZyYWcuaWQpXG4gICAgICBwcm9nVmFyID0gY3JlYXRlU3RhdGljRGVjbChmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICByZXR1cm4gZW52LmxpbmsocHJvZ3JhbSlcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHByb2dWYXIgPSBuZXcgRGVjbGFyYXRpb24oXG4gICAgICAgIChmcmFnICYmIGZyYWcudGhpc0RlcCkgfHwgKHZlcnQgJiYgdmVydC50aGlzRGVwKSxcbiAgICAgICAgKGZyYWcgJiYgZnJhZy5jb250ZXh0RGVwKSB8fCAodmVydCAmJiB2ZXJ0LmNvbnRleHREZXApLFxuICAgICAgICAoZnJhZyAmJiBmcmFnLnByb3BEZXApIHx8ICh2ZXJ0ICYmIHZlcnQucHJvcERlcCksXG4gICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgdmFyIFNIQURFUl9TVEFURSA9IGVudi5zaGFyZWQuc2hhZGVyXG4gICAgICAgICAgdmFyIGZyYWdJZFxuICAgICAgICAgIGlmIChmcmFnKSB7XG4gICAgICAgICAgICBmcmFnSWQgPSBmcmFnLmFwcGVuZChlbnYsIHNjb3BlKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcmFnSWQgPSBzY29wZS5kZWYoU0hBREVSX1NUQVRFLCAnLicsIFNfRlJBRylcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHZlcnRJZFxuICAgICAgICAgIGlmICh2ZXJ0KSB7XG4gICAgICAgICAgICB2ZXJ0SWQgPSB2ZXJ0LmFwcGVuZChlbnYsIHNjb3BlKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2ZXJ0SWQgPSBzY29wZS5kZWYoU0hBREVSX1NUQVRFLCAnLicsIFNfVkVSVClcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHByb2dEZWYgPSBTSEFERVJfU1RBVEUgKyAnLnByb2dyYW0oJyArIHZlcnRJZCArICcsJyArIGZyYWdJZFxuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiBzY29wZS5kZWYocHJvZ0RlZiArICcpJylcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZnJhZzogZnJhZyxcbiAgICAgIHZlcnQ6IHZlcnQsXG4gICAgICBwcm9nVmFyOiBwcm9nVmFyLFxuICAgICAgcHJvZ3JhbTogcHJvZ3JhbVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlRHJhdyAob3B0aW9ucywgZW52KSB7XG4gICAgdmFyIHN0YXRpY09wdGlvbnMgPSBvcHRpb25zLnN0YXRpY1xuICAgIHZhciBkeW5hbWljT3B0aW9ucyA9IG9wdGlvbnMuZHluYW1pY1xuXG4gICAgZnVuY3Rpb24gcGFyc2VFbGVtZW50cyAoKSB7XG4gICAgICBpZiAoU19FTEVNRU5UUyBpbiBzdGF0aWNPcHRpb25zKSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IHN0YXRpY09wdGlvbnNbU19FTEVNRU5UU11cbiAgICAgICAgaWYgKGlzQnVmZmVyQXJncyhlbGVtZW50cykpIHtcbiAgICAgICAgICBlbGVtZW50cyA9IGVsZW1lbnRTdGF0ZS5nZXRFbGVtZW50cyhlbGVtZW50U3RhdGUuY3JlYXRlKGVsZW1lbnRzLCB0cnVlKSlcbiAgICAgICAgfSBlbHNlIGlmIChlbGVtZW50cykge1xuICAgICAgICAgIGVsZW1lbnRzID0gZWxlbWVudFN0YXRlLmdldEVsZW1lbnRzKGVsZW1lbnRzKVxuICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQgPSBjcmVhdGVTdGF0aWNEZWNsKGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgaWYgKGVsZW1lbnRzKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZW52LmxpbmsoZWxlbWVudHMpXG4gICAgICAgICAgICBlbnYuRUxFTUVOVFMgPSByZXN1bHRcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICB9XG4gICAgICAgICAgZW52LkVMRU1FTlRTID0gbnVsbFxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH0pXG4gICAgICAgIHJlc3VsdC52YWx1ZSA9IGVsZW1lbnRzXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIH0gZWxzZSBpZiAoU19FTEVNRU5UUyBpbiBkeW5hbWljT3B0aW9ucykge1xuICAgICAgICB2YXIgZHluID0gZHluYW1pY09wdGlvbnNbU19FTEVNRU5UU11cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUR5bmFtaWNEZWNsKGR5biwgZnVuY3Rpb24gKGVudiwgc2NvcGUpIHtcbiAgICAgICAgICB2YXIgc2hhcmVkID0gZW52LnNoYXJlZFxuXG4gICAgICAgICAgdmFyIElTX0JVRkZFUl9BUkdTID0gc2hhcmVkLmlzQnVmZmVyQXJnc1xuICAgICAgICAgIHZhciBFTEVNRU5UX1NUQVRFID0gc2hhcmVkLmVsZW1lbnRzXG5cbiAgICAgICAgICB2YXIgZWxlbWVudERlZm4gPSBlbnYuaW52b2tlKHNjb3BlLCBkeW4pXG4gICAgICAgICAgdmFyIGVsZW1lbnRzID0gc2NvcGUuZGVmKCdudWxsJylcbiAgICAgICAgICB2YXIgZWxlbWVudFN0cmVhbSA9IHNjb3BlLmRlZihJU19CVUZGRVJfQVJHUywgJygnLCBlbGVtZW50RGVmbiwgJyknKVxuXG4gICAgICAgICAgdmFyIGlmdGUgPSBlbnYuY29uZChlbGVtZW50U3RyZWFtKVxuICAgICAgICAgICAgLnRoZW4oZWxlbWVudHMsICc9JywgRUxFTUVOVF9TVEFURSwgJy5jcmVhdGVTdHJlYW0oJywgZWxlbWVudERlZm4sICcpOycpXG4gICAgICAgICAgICAuZWxzZShlbGVtZW50cywgJz0nLCBFTEVNRU5UX1NUQVRFLCAnLmdldEVsZW1lbnRzKCcsIGVsZW1lbnREZWZuLCAnKTsnKVxuXG4gICAgICAgICAgXG5cbiAgICAgICAgICBzY29wZS5lbnRyeShpZnRlKVxuICAgICAgICAgIHNjb3BlLmV4aXQoXG4gICAgICAgICAgICBlbnYuY29uZChlbGVtZW50U3RyZWFtKVxuICAgICAgICAgICAgICAudGhlbihFTEVNRU5UX1NUQVRFLCAnLmRlc3Ryb3lTdHJlYW0oJywgZWxlbWVudHMsICcpOycpKVxuXG4gICAgICAgICAgZW52LkVMRU1FTlRTID0gZWxlbWVudHNcblxuICAgICAgICAgIHJldHVybiBlbGVtZW50c1xuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBlbGVtZW50cyA9IHBhcnNlRWxlbWVudHMoKVxuXG4gICAgZnVuY3Rpb24gcGFyc2VQcmltaXRpdmUgKCkge1xuICAgICAgaWYgKFNfUFJJTUlUSVZFIGluIHN0YXRpY09wdGlvbnMpIHtcbiAgICAgICAgdmFyIHByaW1pdGl2ZSA9IHN0YXRpY09wdGlvbnNbU19QUklNSVRJVkVdXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY3JlYXRlU3RhdGljRGVjbChmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICAgIHJldHVybiBwcmltVHlwZXNbcHJpbWl0aXZlXVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmIChTX1BSSU1JVElWRSBpbiBkeW5hbWljT3B0aW9ucykge1xuICAgICAgICB2YXIgZHluUHJpbWl0aXZlID0gZHluYW1pY09wdGlvbnNbU19QUklNSVRJVkVdXG4gICAgICAgIHJldHVybiBjcmVhdGVEeW5hbWljRGVjbChkeW5QcmltaXRpdmUsIGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgdmFyIFBSSU1fVFlQRVMgPSBlbnYuY29uc3RhbnRzLnByaW1UeXBlc1xuICAgICAgICAgIHZhciBwcmltID0gZW52Lmludm9rZShzY29wZSwgZHluUHJpbWl0aXZlKVxuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiBzY29wZS5kZWYoUFJJTV9UWVBFUywgJ1snLCBwcmltLCAnXScpXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnRzKSB7XG4gICAgICAgIGlmIChpc1N0YXRpYyhlbGVtZW50cykpIHtcbiAgICAgICAgICBpZiAoZWxlbWVudHMudmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdGF0aWNEZWNsKGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5kZWYoZW52LkVMRU1FTlRTLCAnLnByaW1UeXBlJylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVTdGF0aWNEZWNsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIEdMX1RSSUFOR0xFU1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBEZWNsYXJhdGlvbihcbiAgICAgICAgICAgIGVsZW1lbnRzLnRoaXNEZXAsXG4gICAgICAgICAgICBlbGVtZW50cy5jb250ZXh0RGVwLFxuICAgICAgICAgICAgZWxlbWVudHMucHJvcERlcCxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGVudi5FTEVNRU5UU1xuICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZGVmKGVsZW1lbnRzLCAnPycsIGVsZW1lbnRzLCAnLnByaW1UeXBlOicsIEdMX1RSSUFOR0xFUylcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VQYXJhbSAocGFyYW0sIGlzT2Zmc2V0KSB7XG4gICAgICBpZiAocGFyYW0gaW4gc3RhdGljT3B0aW9ucykge1xuICAgICAgICB2YXIgdmFsdWUgPSBzdGF0aWNPcHRpb25zW3BhcmFtXSB8IDBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjcmVhdGVTdGF0aWNEZWNsKGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgaWYgKGlzT2Zmc2V0KSB7XG4gICAgICAgICAgICBlbnYuT0ZGU0VUID0gdmFsdWVcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKHBhcmFtIGluIGR5bmFtaWNPcHRpb25zKSB7XG4gICAgICAgIHZhciBkeW5WYWx1ZSA9IGR5bmFtaWNPcHRpb25zW3BhcmFtXVxuICAgICAgICByZXR1cm4gY3JlYXRlRHluYW1pY0RlY2woZHluVmFsdWUsIGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGVudi5pbnZva2Uoc2NvcGUsIGR5blZhbHVlKVxuICAgICAgICAgIGlmIChpc09mZnNldCkge1xuICAgICAgICAgICAgZW52Lk9GRlNFVCA9IHJlc3VsdFxuICAgICAgICAgICAgXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSBpZiAoaXNPZmZzZXQgJiYgZWxlbWVudHMpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZVN0YXRpY0RlY2woZnVuY3Rpb24gKGVudiwgc2NvcGUpIHtcbiAgICAgICAgICBlbnYuT0ZGU0VUID0gJzAnXG4gICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgdmFyIE9GRlNFVCA9IHBhcnNlUGFyYW0oU19PRkZTRVQsIHRydWUpXG5cbiAgICBmdW5jdGlvbiBwYXJzZVZlcnRDb3VudCAoKSB7XG4gICAgICBpZiAoU19DT1VOVCBpbiBzdGF0aWNPcHRpb25zKSB7XG4gICAgICAgIHZhciBjb3VudCA9IHN0YXRpY09wdGlvbnNbU19DT1VOVF0gfCAwXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY3JlYXRlU3RhdGljRGVjbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGNvdW50XG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKFNfQ09VTlQgaW4gZHluYW1pY09wdGlvbnMpIHtcbiAgICAgICAgdmFyIGR5bkNvdW50ID0gZHluYW1pY09wdGlvbnNbU19DT1VOVF1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUR5bmFtaWNEZWNsKGR5bkNvdW50LCBmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBlbnYuaW52b2tlKHNjb3BlLCBkeW5Db3VudClcbiAgICAgICAgICBcbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnRzKSB7XG4gICAgICAgIGlmIChpc1N0YXRpYyhlbGVtZW50cykpIHtcbiAgICAgICAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgICAgICAgIGlmIChPRkZTRVQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEZWNsYXJhdGlvbihcbiAgICAgICAgICAgICAgICBPRkZTRVQudGhpc0RlcCxcbiAgICAgICAgICAgICAgICBPRkZTRVQuY29udGV4dERlcCxcbiAgICAgICAgICAgICAgICBPRkZTRVQucHJvcERlcCxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHNjb3BlLmRlZihcbiAgICAgICAgICAgICAgICAgICAgZW52LkVMRU1FTlRTLCAnLnZlcnRDb3VudC0nLCBlbnYuT0ZGU0VUKVxuXG4gICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlU3RhdGljRGVjbChmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5kZWYoZW52LkVMRU1FTlRTLCAnLnZlcnRDb3VudCcpXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBjcmVhdGVTdGF0aWNEZWNsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB2YXJpYWJsZSA9IG5ldyBEZWNsYXJhdGlvbihcbiAgICAgICAgICAgIGVsZW1lbnRzLnRoaXNEZXAgfHwgT0ZGU0VULnRoaXNEZXAsXG4gICAgICAgICAgICBlbGVtZW50cy5jb250ZXh0RGVwIHx8IE9GRlNFVC5jb250ZXh0RGVwLFxuICAgICAgICAgICAgZWxlbWVudHMucHJvcERlcCB8fCBPRkZTRVQucHJvcERlcCxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGVudi5FTEVNRU5UU1xuICAgICAgICAgICAgICBpZiAoZW52Lk9GRlNFVCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzY29wZS5kZWYoZWxlbWVudHMsICc/JywgZWxlbWVudHMsICcudmVydENvdW50LScsXG4gICAgICAgICAgICAgICAgICBlbnYuT0ZGU0VULCAnOi0xJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZGVmKGVsZW1lbnRzLCAnPycsIGVsZW1lbnRzLCAnLnZlcnRDb3VudDotMScpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIFxuICAgICAgICAgIHJldHVybiB2YXJpYWJsZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBlbGVtZW50czogZWxlbWVudHMsXG4gICAgICBwcmltaXRpdmU6IHBhcnNlUHJpbWl0aXZlKCksXG4gICAgICBjb3VudDogcGFyc2VWZXJ0Q291bnQoKSxcbiAgICAgIGluc3RhbmNlczogcGFyc2VQYXJhbShTX0lOU1RBTkNFUywgZmFsc2UpLFxuICAgICAgb2Zmc2V0OiBPRkZTRVRcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUdMU3RhdGUgKG9wdGlvbnMsIGVudikge1xuICAgIHZhciBzdGF0aWNPcHRpb25zID0gb3B0aW9ucy5zdGF0aWNcbiAgICB2YXIgZHluYW1pY09wdGlvbnMgPSBvcHRpb25zLmR5bmFtaWNcblxuICAgIHZhciBTVEFURSA9IHt9XG5cbiAgICBHTF9TVEFURV9OQU1FUy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICB2YXIgcGFyYW0gPSBwcm9wTmFtZShwcm9wKVxuXG4gICAgICBmdW5jdGlvbiBwYXJzZVBhcmFtIChwYXJzZVN0YXRpYywgcGFyc2VEeW5hbWljKSB7XG4gICAgICAgIGlmIChwcm9wIGluIHN0YXRpY09wdGlvbnMpIHtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJzZVN0YXRpYyhzdGF0aWNPcHRpb25zW3Byb3BdKVxuICAgICAgICAgIFNUQVRFW3BhcmFtXSA9IGNyZWF0ZVN0YXRpY0RlY2woZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmIChwcm9wIGluIGR5bmFtaWNPcHRpb25zKSB7XG4gICAgICAgICAgdmFyIGR5biA9IGR5bmFtaWNPcHRpb25zW3Byb3BdXG4gICAgICAgICAgU1RBVEVbcGFyYW1dID0gY3JlYXRlRHluYW1pY0RlY2woZHluLCBmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlRHluYW1pYyhlbnYsIHNjb3BlLCBlbnYuaW52b2tlKHNjb3BlLCBkeW4pKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3dpdGNoIChwcm9wKSB7XG4gICAgICAgIGNhc2UgU19DVUxMX0VOQUJMRTpcbiAgICAgICAgY2FzZSBTX0JMRU5EX0VOQUJMRTpcbiAgICAgICAgY2FzZSBTX0RJVEhFUjpcbiAgICAgICAgY2FzZSBTX1NURU5DSUxfRU5BQkxFOlxuICAgICAgICBjYXNlIFNfREVQVEhfRU5BQkxFOlxuICAgICAgICBjYXNlIFNfU0NJU1NPUl9FTkFCTEU6XG4gICAgICAgIGNhc2UgU19QT0xZR09OX09GRlNFVF9FTkFCTEU6XG4gICAgICAgIGNhc2UgU19TQU1QTEVfQUxQSEE6XG4gICAgICAgIGNhc2UgU19TQU1QTEVfRU5BQkxFOlxuICAgICAgICBjYXNlIFNfREVQVEhfTUFTSzpcbiAgICAgICAgICByZXR1cm4gcGFyc2VQYXJhbShcbiAgICAgICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVudiwgc2NvcGUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgY2FzZSBTX0RFUFRIX0ZVTkM6XG4gICAgICAgICAgcmV0dXJuIHBhcnNlUGFyYW0oXG4gICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBjb21wYXJlRnVuY3NbdmFsdWVdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVudiwgc2NvcGUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgIHZhciBDT01QQVJFX0ZVTkNTID0gZW52LmNvbnN0YW50cy5jb21wYXJlRnVuY3NcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5kZWYoQ09NUEFSRV9GVU5DUywgJ1snLCB2YWx1ZSwgJ10nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBjYXNlIFNfREVQVEhfUkFOR0U6XG4gICAgICAgICAgcmV0dXJuIHBhcnNlUGFyYW0oXG4gICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlLCB2YWx1ZSkge1xuICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICB2YXIgWl9ORUFSID0gc2NvcGUuZGVmKCcrJywgdmFsdWUsICdbMF0nKVxuICAgICAgICAgICAgICB2YXIgWl9GQVIgPSBzY29wZS5kZWYoJysnLCB2YWx1ZSwgJ1sxXScpXG4gICAgICAgICAgICAgIHJldHVybiBbWl9ORUFSLCBaX0ZBUl1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgY2FzZSBTX0JMRU5EX0ZVTkM6XG4gICAgICAgICAgcmV0dXJuIHBhcnNlUGFyYW0oXG4gICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHZhciBzcmNSR0IgPSAoJ3NyY1JHQicgaW4gdmFsdWUgPyB2YWx1ZS5zcmNSR0IgOiB2YWx1ZS5zcmMpXG4gICAgICAgICAgICAgIHZhciBzcmNBbHBoYSA9ICgnc3JjQWxwaGEnIGluIHZhbHVlID8gdmFsdWUuc3JjQWxwaGEgOiB2YWx1ZS5zcmMpXG4gICAgICAgICAgICAgIHZhciBkc3RSR0IgPSAoJ2RzdFJHQicgaW4gdmFsdWUgPyB2YWx1ZS5kc3RSR0IgOiB2YWx1ZS5kc3QpXG4gICAgICAgICAgICAgIHZhciBkc3RBbHBoYSA9ICgnZHN0QWxwaGEnIGluIHZhbHVlID8gdmFsdWUuZHN0QWxwaGEgOiB2YWx1ZS5kc3QpXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgYmxlbmRGdW5jc1tzcmNSR0JdLFxuICAgICAgICAgICAgICAgIGJsZW5kRnVuY3NbZHN0UkdCXSxcbiAgICAgICAgICAgICAgICBibGVuZEZ1bmNzW3NyY0FscGhhXSxcbiAgICAgICAgICAgICAgICBibGVuZEZ1bmNzW2RzdEFscGhhXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVudiwgc2NvcGUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgIHZhciBCTEVORF9GVU5DUyA9IGVudi5jb25zdGFudHMuYmxlbmRGdW5jc1xuXG4gICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIHJlYWQgKHByZWZpeCwgc3VmZml4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGZ1bmMgPSBzY29wZS5kZWYoXG4gICAgICAgICAgICAgICAgICAnXCInLCBwcmVmaXgsIHN1ZmZpeCwgJ1wiIGluICcsIHZhbHVlLFxuICAgICAgICAgICAgICAgICAgJz8nLCB2YWx1ZSwgJy4nLCBwcmVmaXgsIHN1ZmZpeCxcbiAgICAgICAgICAgICAgICAgICc6JywgdmFsdWUsICcuJywgcHJlZml4KVxuXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdmFyIHNyY1JHQiA9IHJlYWQoJ3NyYycsICdSR0InKVxuICAgICAgICAgICAgICB2YXIgZHN0UkdCID0gcmVhZCgnZHN0JywgJ1JHQicpXG5cbiAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgdmFyIFNSQ19SR0IgPSBzY29wZS5kZWYoQkxFTkRfRlVOQ1MsICdbJywgc3JjUkdCLCAnXScpXG4gICAgICAgICAgICAgIHZhciBTUkNfQUxQSEEgPSBzY29wZS5kZWYoQkxFTkRfRlVOQ1MsICdbJywgcmVhZCgnc3JjJywgJ0FscGhhJyksICddJylcbiAgICAgICAgICAgICAgdmFyIERTVF9SR0IgPSBzY29wZS5kZWYoQkxFTkRfRlVOQ1MsICdbJywgZHN0UkdCLCAnXScpXG4gICAgICAgICAgICAgIHZhciBEU1RfQUxQSEEgPSBzY29wZS5kZWYoQkxFTkRfRlVOQ1MsICdbJywgcmVhZCgnZHN0JywgJ0FscGhhJyksICddJylcblxuICAgICAgICAgICAgICByZXR1cm4gW1NSQ19SR0IsIERTVF9SR0IsIFNSQ19BTFBIQSwgRFNUX0FMUEhBXVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBjYXNlIFNfQkxFTkRfRVFVQVRJT046XG4gICAgICAgICAgcmV0dXJuIHBhcnNlUGFyYW0oXG4gICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgYmxlbmRFcXVhdGlvbnNbdmFsdWVdLFxuICAgICAgICAgICAgICAgICAgYmxlbmRFcXVhdGlvbnNbdmFsdWVdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgYmxlbmRFcXVhdGlvbnNbdmFsdWUucmdiXSxcbiAgICAgICAgICAgICAgICAgIGJsZW5kRXF1YXRpb25zW3ZhbHVlLmFscGhhXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlLCB2YWx1ZSkge1xuICAgICAgICAgICAgICB2YXIgQkxFTkRfRVFVQVRJT05TID0gZW52LmNvbnN0YW50cy5ibGVuZEVxdWF0aW9uc1xuXG4gICAgICAgICAgICAgIHZhciBSR0IgPSBzY29wZS5kZWYoKVxuICAgICAgICAgICAgICB2YXIgQUxQSEEgPSBzY29wZS5kZWYoKVxuXG4gICAgICAgICAgICAgIHZhciBpZnRlID0gZW52LmNvbmQoJ3R5cGVvZiAnLCB2YWx1ZSwgJz09PVwic3RyaW5nXCInKVxuXG4gICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgIGlmdGUudGhlbihcbiAgICAgICAgICAgICAgICBSR0IsICc9JywgQUxQSEEsICc9JywgQkxFTkRfRVFVQVRJT05TLCAnWycsIHZhbHVlLCAnXTsnKVxuICAgICAgICAgICAgICBpZnRlLmVsc2UoXG4gICAgICAgICAgICAgICAgUkdCLCAnPScsIEJMRU5EX0VRVUFUSU9OUywgJ1snLCB2YWx1ZSwgJy5yZ2JdOycsXG4gICAgICAgICAgICAgICAgQUxQSEEsICc9JywgQkxFTkRfRVFVQVRJT05TLCAnWycsIHZhbHVlLCAnLmFscGhhXTsnKVxuXG4gICAgICAgICAgICAgIHNjb3BlKGlmdGUpXG5cbiAgICAgICAgICAgICAgcmV0dXJuIFtSR0IsIEFMUEhBXVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBjYXNlIFNfQkxFTkRfQ09MT1I6XG4gICAgICAgICAgcmV0dXJuIHBhcnNlUGFyYW0oXG4gICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBsb29wKDQsIGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICt2YWx1ZVtpXVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlLCB2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIGxvb3AoNCwgZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZGVmKCcrJywgdmFsdWUsICdbJywgaSwgJ10nKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBjYXNlIFNfU1RFTkNJTF9NQVNLOlxuICAgICAgICAgIHJldHVybiBwYXJzZVBhcmFtKFxuICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgfCAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVudiwgc2NvcGUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gc2NvcGUuZGVmKHZhbHVlLCAnfDAnKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBjYXNlIFNfU1RFTkNJTF9GVU5DOlxuICAgICAgICAgIHJldHVybiBwYXJzZVBhcmFtKFxuICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB2YXIgY21wID0gdmFsdWUuY21wIHx8ICdrZWVwJ1xuICAgICAgICAgICAgICB2YXIgcmVmID0gdmFsdWUucmVmIHx8IDBcbiAgICAgICAgICAgICAgdmFyIG1hc2sgPSAnbWFzaycgaW4gdmFsdWUgPyB2YWx1ZS5tYXNrIDogLTFcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBjb21wYXJlRnVuY3NbY21wXSxcbiAgICAgICAgICAgICAgICByZWYsXG4gICAgICAgICAgICAgICAgbWFza1xuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVudiwgc2NvcGUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgIHZhciBDT01QQVJFX0ZVTkNTID0gZW52LmNvbnN0YW50cy5jb21wYXJlRnVuY3NcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHZhciBjbXAgPSBzY29wZS5kZWYoXG4gICAgICAgICAgICAgICAgJ1wiY21wXCIgaW4gJywgdmFsdWUsXG4gICAgICAgICAgICAgICAgJz8nLCBDT01QQVJFX0ZVTkNTLCAnWycsIHZhbHVlLCAnLmNtcF0nLFxuICAgICAgICAgICAgICAgICc6JywgR0xfS0VFUClcbiAgICAgICAgICAgICAgdmFyIHJlZiA9IHNjb3BlLmRlZih2YWx1ZSwgJy5yZWZ8MCcpXG4gICAgICAgICAgICAgIHZhciBtYXNrID0gc2NvcGUuZGVmKFxuICAgICAgICAgICAgICAgICdcIm1hc2tcIiBpbiAnLCB2YWx1ZSxcbiAgICAgICAgICAgICAgICAnPycsIHZhbHVlLCAnLm1hc2t8MDotMScpXG4gICAgICAgICAgICAgIHJldHVybiBbY21wLCByZWYsIG1hc2tdXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIGNhc2UgU19TVEVOQ0lMX09QRlJPTlQ6XG4gICAgICAgIGNhc2UgU19TVEVOQ0lMX09QQkFDSzpcbiAgICAgICAgICByZXR1cm4gcGFyc2VQYXJhbShcbiAgICAgICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgdmFyIGZhaWwgPSB2YWx1ZS5mYWlsIHx8ICdrZWVwJ1xuICAgICAgICAgICAgICB2YXIgemZhaWwgPSB2YWx1ZS56ZmFpbCB8fCAna2VlcCdcbiAgICAgICAgICAgICAgdmFyIHpwYXNzID0gdmFsdWUuenBhc3MgfHwgJ2tlZXAnXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgcHJvcCA9PT0gU19TVEVOQ0lMX09QQkFDSyA/IEdMX0JBQ0sgOiBHTF9GUk9OVCxcbiAgICAgICAgICAgICAgICBzdGVuY2lsT3BzW2ZhaWxdLFxuICAgICAgICAgICAgICAgIHN0ZW5jaWxPcHNbemZhaWxdLFxuICAgICAgICAgICAgICAgIHN0ZW5jaWxPcHNbenBhc3NdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZW52LCBzY29wZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgdmFyIFNURU5DSUxfT1BTID0gZW52LmNvbnN0YW50cy5zdGVuY2lsT3BzXG5cbiAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgZnVuY3Rpb24gcmVhZCAobmFtZSkge1xuICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmRlZihcbiAgICAgICAgICAgICAgICAgICdcIicsIG5hbWUsICdcIiBpbiAnLCB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICc/JywgU1RFTkNJTF9PUFMsICdbJywgdmFsdWUsICcuJywgbmFtZSwgJ106JyxcbiAgICAgICAgICAgICAgICAgIEdMX0tFRVApXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIHByb3AgPT09IFNfU1RFTkNJTF9PUEJBQ0sgPyBHTF9CQUNLIDogR0xfRlJPTlQsXG4gICAgICAgICAgICAgICAgcmVhZCgnZmFpbCcpLFxuICAgICAgICAgICAgICAgIHJlYWQoJ3pmYWlsJyksXG4gICAgICAgICAgICAgICAgcmVhZCgnenBhc3MnKVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIGNhc2UgU19QT0xZR09OX09GRlNFVF9PRkZTRVQ6XG4gICAgICAgICAgcmV0dXJuIHBhcnNlUGFyYW0oXG4gICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHZhciBmYWN0b3IgPSB2YWx1ZS5mYWN0b3IgfCAwXG4gICAgICAgICAgICAgIHZhciB1bml0cyA9IHZhbHVlLnVuaXRzIHwgMFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBbZmFjdG9yLCB1bml0c11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZW52LCBzY29wZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgdmFyIEZBQ1RPUiA9IHNjb3BlLmRlZih2YWx1ZSwgJy5mYWN0b3J8MCcpXG4gICAgICAgICAgICAgIHZhciBVTklUUyA9IHNjb3BlLmRlZih2YWx1ZSwgJy51bml0c3wwJylcblxuICAgICAgICAgICAgICByZXR1cm4gW0ZBQ1RPUiwgVU5JVFNdXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIGNhc2UgU19DVUxMX0ZBQ0U6XG4gICAgICAgICAgcmV0dXJuIHBhcnNlUGFyYW0oXG4gICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgdmFyIGZhY2UgPSAwXG4gICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ2Zyb250Jykge1xuICAgICAgICAgICAgICAgIGZhY2UgPSBHTF9GUk9OVFxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAnYmFjaycpIHtcbiAgICAgICAgICAgICAgICBmYWNlID0gR0xfQkFDS1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gZmFjZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlLCB2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmRlZih2YWx1ZSwgJz09PVwiZnJvbnRcIj8nLCBHTF9GUk9OVCwgJzonLCBHTF9CQUNLKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBjYXNlIFNfTElORV9XSURUSDpcbiAgICAgICAgICByZXR1cm4gcGFyc2VQYXJhbShcbiAgICAgICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVudiwgc2NvcGUsIHZhbHVlKSB7XG4gICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBjYXNlIFNfRlJPTlRfRkFDRTpcbiAgICAgICAgICByZXR1cm4gcGFyc2VQYXJhbShcbiAgICAgICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIG9yaWVudGF0aW9uVHlwZVt2YWx1ZV1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZW52LCBzY29wZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiBzY29wZS5kZWYodmFsdWUgKyAnPT09XCJjd1wiPycgKyBHTF9DVyArICc6JyArIEdMX0NDVylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgY2FzZSBTX0NPTE9SX01BU0s6XG4gICAgICAgICAgcmV0dXJuIHBhcnNlUGFyYW0oXG4gICAgICAgICAgICBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5tYXAoZnVuY3Rpb24gKHYpIHsgcmV0dXJuICEhdiB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlLCB2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIGxvb3AoNCwgZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyEhJyArIHZhbHVlICsgJ1snICsgaSArICddJ1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBjYXNlIFNfU0FNUExFX0NPVkVSQUdFOlxuICAgICAgICAgIHJldHVybiBwYXJzZVBhcmFtKFxuICAgICAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB2YXIgc2FtcGxlVmFsdWUgPSAndmFsdWUnIGluIHZhbHVlID8gdmFsdWUudmFsdWUgOiAxXG4gICAgICAgICAgICAgIHZhciBzYW1wbGVJbnZlcnQgPSAhIXZhbHVlLmludmVydFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcmV0dXJuIFtzYW1wbGVWYWx1ZSwgc2FtcGxlSW52ZXJ0XVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlbnYsIHNjb3BlLCB2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgdmFyIFZBTFVFID0gc2NvcGUuZGVmKFxuICAgICAgICAgICAgICAgICdcInZhbHVlXCIgaW4gJywgdmFsdWUsICc/KycsIHZhbHVlLCAnLnZhbHVlOjEnKVxuICAgICAgICAgICAgICB2YXIgSU5WRVJUID0gc2NvcGUuZGVmKCchIScsIHZhbHVlLCAnLmludmVydCcpXG4gICAgICAgICAgICAgIHJldHVybiBbVkFMVUUsIElOVkVSVF1cbiAgICAgICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBTVEFURVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VVbmlmb3JtcyAodW5pZm9ybXMsIGVudikge1xuICAgIHZhciBzdGF0aWNVbmlmb3JtcyA9IHVuaWZvcm1zLnN0YXRpY1xuICAgIHZhciBkeW5hbWljVW5pZm9ybXMgPSB1bmlmb3Jtcy5keW5hbWljXG5cbiAgICB2YXIgVU5JRk9STVMgPSB7fVxuXG4gICAgT2JqZWN0LmtleXMoc3RhdGljVW5pZm9ybXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHN0YXRpY1VuaWZvcm1zW25hbWVdXG4gICAgICB2YXIgcmVzdWx0XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHJlc3VsdCA9IGNyZWF0ZVN0YXRpY0RlY2woZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFyIHJlZ2xUeXBlID0gdmFsdWUuX3JlZ2xUeXBlXG4gICAgICAgIGlmIChyZWdsVHlwZSA9PT0gJ3RleHR1cmUyZCcgfHxcbiAgICAgICAgICAgIHJlZ2xUeXBlID09PSAndGV4dHVyZUN1YmUnKSB7XG4gICAgICAgICAgcmVzdWx0ID0gY3JlYXRlU3RhdGljRGVjbChmdW5jdGlvbiAoZW52KSB7XG4gICAgICAgICAgICByZXR1cm4gZW52LmxpbmsodmFsdWUpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmIChyZWdsVHlwZSA9PT0gJ2ZyYW1lYnVmZmVyJyB8fFxuICAgICAgICAgICAgICAgICAgIHJlZ2xUeXBlID09PSAnZnJhbWVidWZmZXJDdWJlJykge1xuICAgICAgICAgIFxuICAgICAgICAgIHJlc3VsdCA9IGNyZWF0ZVN0YXRpY0RlY2woZnVuY3Rpb24gKGVudikge1xuICAgICAgICAgICAgcmV0dXJuIGVudi5saW5rKHZhbHVlLmNvbG9yWzBdKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNBcnJheUxpa2UodmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdCA9IGNyZWF0ZVN0YXRpY0RlY2woZnVuY3Rpb24gKGVudikge1xuICAgICAgICAgIHZhciBJVEVNID0gZW52Lmdsb2JhbC5kZWYoJ1snLFxuICAgICAgICAgICAgbG9vcCh2YWx1ZS5sZW5ndGgsIGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICByZXR1cm4gdmFsdWVbaV1cbiAgICAgICAgICAgIH0pLCAnXScpXG4gICAgICAgICAgcmV0dXJuIElURU1cbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFxuICAgICAgfVxuICAgICAgcmVzdWx0LnZhbHVlID0gdmFsdWVcbiAgICAgIFVOSUZPUk1TW25hbWVdID0gcmVzdWx0XG4gICAgfSlcblxuICAgIE9iamVjdC5rZXlzKGR5bmFtaWNVbmlmb3JtcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgZHluID0gZHluYW1pY1VuaWZvcm1zW2tleV1cbiAgICAgIFVOSUZPUk1TW2tleV0gPSBjcmVhdGVEeW5hbWljRGVjbChkeW4sIGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgIHJldHVybiBlbnYuaW52b2tlKHNjb3BlLCBkeW4pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICByZXR1cm4gVU5JRk9STVNcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlQXR0cmlidXRlcyAoYXR0cmlidXRlcywgZW52KSB7XG4gICAgdmFyIHN0YXRpY0F0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzLnN0YXRpY1xuICAgIHZhciBkeW5hbWljQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMuZHluYW1pY1xuXG4gICAgdmFyIGF0dHJpYnV0ZURlZnMgPSB7fVxuXG4gICAgT2JqZWN0LmtleXMoc3RhdGljQXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbiAoYXR0cmlidXRlKSB7XG4gICAgICB2YXIgdmFsdWUgPSBzdGF0aWNBdHRyaWJ1dGVzW2F0dHJpYnV0ZV1cbiAgICAgIHZhciBpZCA9IHN0cmluZ1N0b3JlLmlkKGF0dHJpYnV0ZSlcblxuICAgICAgdmFyIHJlY29yZCA9IG5ldyBBdHRyaWJ1dGVSZWNvcmQoKVxuICAgICAgaWYgKGlzQnVmZmVyQXJncyh2YWx1ZSkpIHtcbiAgICAgICAgcmVjb3JkLnN0YXRlID0gQVRUUklCX1NUQVRFX1BPSU5URVJcbiAgICAgICAgcmVjb3JkLmJ1ZmZlciA9IGJ1ZmZlclN0YXRlLmdldEJ1ZmZlcihcbiAgICAgICAgICBidWZmZXJTdGF0ZS5jcmVhdGUodmFsdWUsIEdMX0FSUkFZX0JVRkZFUiwgZmFsc2UsIHRydWUpKVxuICAgICAgICByZWNvcmQudHlwZSA9IHJlY29yZC5idWZmZXIuZHR5cGVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBidWZmZXIgPSBidWZmZXJTdGF0ZS5nZXRCdWZmZXIodmFsdWUpXG4gICAgICAgIGlmIChidWZmZXIpIHtcbiAgICAgICAgICByZWNvcmQuc3RhdGUgPSBBVFRSSUJfU1RBVEVfUE9JTlRFUlxuICAgICAgICAgIHJlY29yZC5idWZmZXIgPSBidWZmZXJcbiAgICAgICAgICByZWNvcmQudHlwZSA9IGJ1ZmZlci5kdHlwZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICh2YWx1ZS5jb25zdGFudCkge1xuICAgICAgICAgICAgdmFyIGNvbnN0YW50ID0gdmFsdWUuY29uc3RhbnRcbiAgICAgICAgICAgIHJlY29yZC5idWZmZXIgPSAnbnVsbCdcbiAgICAgICAgICAgIHJlY29yZC5zdGF0ZSA9IEFUVFJJQl9TVEFURV9DT05TVEFOVFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zdGFudCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgcmVjb3JkLnggPSBjb25zdGFudFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIENVVEVfQ09NUE9ORU5UUy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBjb25zdGFudC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgIHJlY29yZFtjXSA9IGNvbnN0YW50W2ldXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaXNCdWZmZXJBcmdzKHZhbHVlLmJ1ZmZlcikpIHtcbiAgICAgICAgICAgICAgYnVmZmVyID0gYnVmZmVyU3RhdGUuZ2V0QnVmZmVyKFxuICAgICAgICAgICAgICAgIGJ1ZmZlclN0YXRlLmNyZWF0ZSh2YWx1ZS5idWZmZXIsIEdMX0FSUkFZX0JVRkZFUiwgZmFsc2UsIHRydWUpKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYnVmZmVyID0gYnVmZmVyU3RhdGUuZ2V0QnVmZmVyKHZhbHVlLmJ1ZmZlcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdmFsdWUub2Zmc2V0IHwgMFxuICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIHZhciBzdHJpZGUgPSB2YWx1ZS5zdHJpZGUgfCAwXG4gICAgICAgICAgICBcblxuICAgICAgICAgICAgdmFyIHNpemUgPSB2YWx1ZS5zaXplIHwgMFxuICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIHZhciBub3JtYWxpemVkID0gISF2YWx1ZS5ub3JtYWxpemVkXG5cbiAgICAgICAgICAgIHZhciB0eXBlID0gMFxuICAgICAgICAgICAgaWYgKCd0eXBlJyBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgdHlwZSA9IGdsVHlwZXNbdmFsdWUudHlwZV1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRpdmlzb3IgPSB2YWx1ZS5kaXZpc29yIHwgMFxuICAgICAgICAgICAgaWYgKCdkaXZpc29yJyBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFxuXG4gICAgICAgICAgICByZWNvcmQuYnVmZmVyID0gYnVmZmVyXG4gICAgICAgICAgICByZWNvcmQuc3RhdGUgPSBBVFRSSUJfU1RBVEVfUE9JTlRFUlxuICAgICAgICAgICAgcmVjb3JkLnNpemUgPSBzaXplXG4gICAgICAgICAgICByZWNvcmQubm9ybWFsaXplZCA9IG5vcm1hbGl6ZWRcbiAgICAgICAgICAgIHJlY29yZC50eXBlID0gdHlwZSB8fCBidWZmZXIuZHR5cGVcbiAgICAgICAgICAgIHJlY29yZC5vZmZzZXQgPSBvZmZzZXRcbiAgICAgICAgICAgIHJlY29yZC5zdHJpZGUgPSBzdHJpZGVcbiAgICAgICAgICAgIHJlY29yZC5kaXZpc29yID0gZGl2aXNvclxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhdHRyaWJ1dGVEZWZzW2F0dHJpYnV0ZV0gPSBjcmVhdGVTdGF0aWNEZWNsKGZ1bmN0aW9uIChlbnYsIHNjb3BlKSB7XG4gICAgICAgIHZhciBjYWNoZSA9IGVudi5hdHRyaWJDYWNoZVxuICAgICAgICBpZiAoaWQgaW4gY2FjaGUpIHtcbiAgICAgICAgICByZXR1cm4gY2FjaGVbaWRdXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICBpc1N0cmVhbTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgICBPYmplY3Qua2V5cyhyZWNvcmQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gcmVjb3JkW2tleV1cbiAgICAgICAgfSlcbiAgICAgICAgaWYgKHJlY29yZC5idWZmZXIpIHtcbiAgICAgICAgICByZXN1bHQuYnVmZmVyID0gZW52LmxpbmsocmVjb3JkLmJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgICBjYWNoZVtpZF0gPSByZXN1bHRcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgT2JqZWN0LmtleXMoZHluYW1pY0F0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGF0dHJpYnV0ZSkge1xuICAgICAgdmFyIGR5biA9IGR5bmFtaWNBdHRyaWJ1dGVzW2F0dHJpYnV0ZV1cblxuICAgICAgZnVuY3Rpb24gYXBwZW5kQXR0cmlidXRlQ29kZSAoZW52LCBibG9jaykge1xuICAgICAgICB2YXIgVkFMVUUgPSBlbnYuaW52b2tlKGJsb2NrLCBkeW4pXG5cbiAgICAgICAgdmFyIHNoYXJlZCA9IGVudi5zaGFyZWRcblxuICAgICAgICB2YXIgSVNfQlVGRkVSX0FSR1MgPSBzaGFyZWQuaXNCdWZmZXJBcmdzXG4gICAgICAgIHZhciBCVUZGRVJfU1RBVEUgPSBzaGFyZWQuYnVmZmVyXG5cbiAgICAgICAgLy8gUGVyZm9ybSB2YWxpZGF0aW9uIG9uIGF0dHJpYnV0ZVxuICAgICAgICBcblxuICAgICAgICAvLyBhbGxvY2F0ZSBuYW1lcyBmb3IgcmVzdWx0XG4gICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgaXNTdHJlYW06IGJsb2NrLmRlZihmYWxzZSlcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGVmYXVsdFJlY29yZCA9IG5ldyBBdHRyaWJ1dGVSZWNvcmQoKVxuICAgICAgICBkZWZhdWx0UmVjb3JkLnN0YXRlID0gQVRUUklCX1NUQVRFX1BPSU5URVJcbiAgICAgICAgT2JqZWN0LmtleXMoZGVmYXVsdFJlY29yZCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSBibG9jay5kZWYoJycgKyBkZWZhdWx0UmVjb3JkW2tleV0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgdmFyIEJVRkZFUiA9IHJlc3VsdC5idWZmZXJcbiAgICAgICAgdmFyIFRZUEUgPSByZXN1bHQudHlwZVxuICAgICAgICBibG9jayhcbiAgICAgICAgICAnaWYoJywgSVNfQlVGRkVSX0FSR1MsICcoJywgVkFMVUUsICcpKXsnLFxuICAgICAgICAgIHJlc3VsdC5pc1N0cmVhbSwgJz10cnVlOycsXG4gICAgICAgICAgQlVGRkVSLCAnPScsIEJVRkZFUl9TVEFURSwgJy5jcmVhdGVTdHJlYW0oJywgR0xfQVJSQVlfQlVGRkVSLCAnLCcsIFZBTFVFLCAnKTsnLFxuICAgICAgICAgIFRZUEUsICc9JywgQlVGRkVSLCAnLmR0eXBlOycsXG4gICAgICAgICAgJ31lbHNleycsXG4gICAgICAgICAgQlVGRkVSLCAnPScsIEJVRkZFUl9TVEFURSwgJy5nZXRCdWZmZXIoJywgVkFMVUUsICcpOycsXG4gICAgICAgICAgJ2lmKCcsIEJVRkZFUiwgJyl7JyxcbiAgICAgICAgICBUWVBFLCAnPScsIEJVRkZFUiwgJy5kdHlwZTsnLFxuICAgICAgICAgICd9ZWxzZSBpZihcImNvbnN0YW50XCIgaW4gJywgVkFMVUUsICcpeycsXG4gICAgICAgICAgcmVzdWx0LnN0YXRlLCAnPScsIEFUVFJJQl9TVEFURV9DT05TVEFOVCwgJzsnLFxuICAgICAgICAgICdpZih0eXBlb2YgJyArIFZBTFVFICsgJy5jb25zdGFudCA9PT0gXCJudW1iZXJcIil7JyxcbiAgICAgICAgICByZXN1bHRbQ1VURV9DT01QT05FTlRTWzBdXSwgJz0nLCBWQUxVRSwgJy5jb25zdGFudDsnLFxuICAgICAgICAgIENVVEVfQ09NUE9ORU5UUy5zbGljZSgxKS5tYXAoZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRbbl1cbiAgICAgICAgICB9KS5qb2luKCc9JyksICc9MDsnLFxuICAgICAgICAgICd9ZWxzZXsnLFxuICAgICAgICAgIENVVEVfQ09NUE9ORU5UUy5tYXAoZnVuY3Rpb24gKG5hbWUsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIHJlc3VsdFtuYW1lXSArICc9JyArIFZBTFVFICsgJy5jb25zdGFudC5sZW5ndGg+PScgKyBpICtcbiAgICAgICAgICAgICAgJz8nICsgVkFMVUUgKyAnLmNvbnN0YW50WycgKyBpICsgJ106MDsnXG4gICAgICAgICAgICApXG4gICAgICAgICAgfSkuam9pbignJyksXG4gICAgICAgICAgJ319ZWxzZXsnLFxuICAgICAgICAgICdpZignLCBJU19CVUZGRVJfQVJHUywgJygnLCBWQUxVRSwgJy5idWZmZXIpKXsnLFxuICAgICAgICAgIEJVRkZFUiwgJz0nLCBCVUZGRVJfU1RBVEUsICcuY3JlYXRlU3RyZWFtKCcsIEdMX0FSUkFZX0JVRkZFUiwgJywnLCBWQUxVRSwgJy5idWZmZXIpOycsXG4gICAgICAgICAgJ31lbHNleycsXG4gICAgICAgICAgQlVGRkVSLCAnPScsIEJVRkZFUl9TVEFURSwgJy5nZXRCdWZmZXIoJywgVkFMVUUsICcuYnVmZmVyKTsnLFxuICAgICAgICAgICd9JyxcbiAgICAgICAgICBUWVBFLCAnPVwidHlwZVwiIGluICcsIFZBTFVFLCAnPycsXG4gICAgICAgICAgc2hhcmVkLmdsVHlwZXMsICdbJywgVkFMVUUsICcudHlwZV06JywgQlVGRkVSLCAnLmR0eXBlOycsXG4gICAgICAgICAgcmVzdWx0Lm5vcm1hbGl6ZWQsICc9ISEnLCBWQUxVRSwgJy5ub3JtYWxpemVkOycpXG4gICAgICAgIGZ1bmN0aW9uIGVtaXRSZWFkUmVjb3JkIChuYW1lKSB7XG4gICAgICAgICAgYmxvY2socmVzdWx0W25hbWVdLCAnPScsIFZBTFVFLCAnLicsIG5hbWUsICd8MDsnKVxuICAgICAgICB9XG4gICAgICAgIGVtaXRSZWFkUmVjb3JkKCdzaXplJylcbiAgICAgICAgZW1pdFJlYWRSZWNvcmQoJ29mZnNldCcpXG4gICAgICAgIGVtaXRSZWFkUmVjb3JkKCdzdHJpZGUnKVxuICAgICAgICBlbWl0UmVhZFJlY29yZCgnZGl2aXNvcicpXG5cbiAgICAgICAgYmxvY2soJ319JylcblxuICAgICAgICBibG9jay5leGl0KFxuICAgICAgICAgICdpZignLCByZXN1bHQuaXNTdHJlYW0sICcpeycsXG4gICAgICAgICAgQlVGRkVSX1NUQVRFLCAnLmRlc3Ryb3lTdHJlYW0oJywgQlVGRkVSLCAnKTsnLFxuICAgICAgICAgICd9JylcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9XG5cbiAgICAgIGF0dHJpYnV0ZURlZnNbYXR0cmlidXRlXSA9IGNyZWF0ZUR5bmFtaWNEZWNsKGR5biwgYXBwZW5kQXR0cmlidXRlQ29kZSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIGF0dHJpYnV0ZURlZnNcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlQ29udGV4dCAoY29udGV4dCkge1xuICAgIHZhciBzdGF0aWNDb250ZXh0ID0gY29udGV4dC5zdGF0aWNcbiAgICB2YXIgZHluYW1pY0NvbnRleHQgPSBjb250ZXh0LmR5bmFtaWNcbiAgICB2YXIgcmVzdWx0ID0ge31cblxuICAgIE9iamVjdC5rZXlzKHN0YXRpY0NvbnRleHQpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHN0YXRpY0NvbnRleHRbbmFtZV1cbiAgICAgIHJlc3VsdFtuYW1lXSA9IGNyZWF0ZVN0YXRpY0RlY2woZnVuY3Rpb24gKGVudiwgc2NvcGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICByZXR1cm4gJycgKyB2YWx1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBlbnYubGluayh2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgT2JqZWN0LmtleXMoZHluYW1pY0NvbnRleHQpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciBkeW4gPSBkeW5hbWljQ29udGV4dFtuYW1lXVxuICAgICAgcmVzdWx0W25hbWVdID0gY3JlYXRlRHluYW1pY0RlY2woZHluLCBmdW5jdGlvbiAoZW52LCBzY29wZSkge1xuICAgICAgICByZXR1cm4gZW52Lmludm9rZShzY29wZSwgZHluKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VBcmd1bWVudHMgKG9wdGlvbnMsIGF0dHJpYnV0ZXMsIHVuaWZvcm1zLCBjb250ZXh0LCBlbnYpIHtcbiAgICB2YXIgc3RhdGljT3B0aW9ucyA9IG9wdGlvbnMuc3RhdGljXG4gICAgdmFyIGR5bmFtaWNPcHRpb25zID0gb3B0aW9ucy5keW5hbWljXG5cbiAgICBcblxuICAgIHZhciBmcmFtZWJ1ZmZlciA9IHBhcnNlRnJhbWVidWZmZXIob3B0aW9ucywgZW52KVxuICAgIHZhciB2aWV3cG9ydEFuZFNjaXNzb3IgPSBwYXJzZVZpZXdwb3J0U2Npc3NvcihvcHRpb25zLCBmcmFtZWJ1ZmZlciwgZW52KVxuICAgIHZhciBkcmF3ID0gcGFyc2VEcmF3KG9wdGlvbnMsIGVudilcbiAgICB2YXIgc3RhdGUgPSBwYXJzZUdMU3RhdGUob3B0aW9ucywgZW52KVxuICAgIHZhciBzaGFkZXIgPSBwYXJzZVByb2dyYW0ob3B0aW9ucywgZW52KVxuXG4gICAgZnVuY3Rpb24gY29weUJveCAobmFtZSkge1xuICAgICAgdmFyIGRlZm4gPSB2aWV3cG9ydEFuZFNjaXNzb3JbbmFtZV1cbiAgICAgIGlmIChkZWZuKSB7XG4gICAgICAgIHN0YXRlW25hbWVdID0gZGVmblxuICAgICAgfVxuICAgIH1cbiAgICBjb3B5Qm94KFNfVklFV1BPUlQpXG4gICAgY29weUJveChwcm9wTmFtZShTX1NDSVNTT1JfQk9YKSlcblxuICAgIHZhciBkaXJ0eSA9IE9iamVjdC5rZXlzKHN0YXRlKS5sZW5ndGggPiAwXG5cbiAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgZnJhbWVidWZmZXI6IGZyYW1lYnVmZmVyLFxuICAgICAgZHJhdzogZHJhdyxcbiAgICAgIHNoYWRlcjogc2hhZGVyLFxuICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgZGlydHk6IGRpcnR5XG4gICAgfVxuXG4gICAgcmVzdWx0LnByb2ZpbGUgPSBwYXJzZVByb2ZpbGUob3B0aW9ucywgZW52KVxuICAgIHJlc3VsdC51bmlmb3JtcyA9IHBhcnNlVW5pZm9ybXModW5pZm9ybXMsIGVudilcbiAgICByZXN1bHQuYXR0cmlidXRlcyA9IHBhcnNlQXR0cmlidXRlcyhhdHRyaWJ1dGVzLCBlbnYpXG4gICAgcmVzdWx0LmNvbnRleHQgPSBwYXJzZUNvbnRleHQoY29udGV4dCwgZW52KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gQ09NTU9OIFVQREFURSBGVU5DVElPTlNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBmdW5jdGlvbiBlbWl0Q29udGV4dCAoZW52LCBzY29wZSwgY29udGV4dCkge1xuICAgIHZhciBzaGFyZWQgPSBlbnYuc2hhcmVkXG4gICAgdmFyIENPTlRFWFQgPSBzaGFyZWQuY29udGV4dFxuXG4gICAgdmFyIGNvbnRleHRFbnRlciA9IGVudi5zY29wZSgpXG5cbiAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBzY29wZS5zYXZlKENPTlRFWFQsICcuJyArIG5hbWUpXG4gICAgICB2YXIgZGVmbiA9IGNvbnRleHRbbmFtZV1cbiAgICAgIGNvbnRleHRFbnRlcihDT05URVhULCAnLicsIG5hbWUsICc9JywgZGVmbi5hcHBlbmQoZW52LCBzY29wZSksICc7JylcbiAgICB9KVxuXG4gICAgc2NvcGUoY29udGV4dEVudGVyKVxuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyBDT01NT04gRFJBV0lORyBGVU5DVElPTlNcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBmdW5jdGlvbiBlbWl0UG9sbEZyYW1lYnVmZmVyIChlbnYsIHNjb3BlLCBmcmFtZWJ1ZmZlciwgc2tpcENoZWNrKSB7XG4gICAgdmFyIHNoYXJlZCA9IGVudi5zaGFyZWRcblxuICAgIHZhciBHTCA9IHNoYXJlZC5nbFxuICAgIHZhciBGUkFNRUJVRkZFUl9TVEFURSA9IHNoYXJlZC5mcmFtZWJ1ZmZlclxuICAgIHZhciBFWFRfRFJBV19CVUZGRVJTXG4gICAgaWYgKGV4dERyYXdCdWZmZXJzKSB7XG4gICAgICBFWFRfRFJBV19CVUZGRVJTID0gc2NvcGUuZGVmKHNoYXJlZC5leHRlbnNpb25zLCAnLndlYmdsX2RyYXdfYnVmZmVycycpXG4gICAgfVxuXG4gICAgdmFyIGNvbnN0YW50cyA9IGVudi5jb25zdGFudHNcblxuICAgIHZhciBEUkFXX0JVRkZFUlMgPSBjb25zdGFudHMuZHJhd0J1ZmZlclxuICAgIHZhciBCQUNLX0JVRkZFUiA9IGNvbnN0YW50cy5iYWNrQnVmZmVyXG5cbiAgICB2YXIgTkVYVFxuICAgIGlmIChmcmFtZWJ1ZmZlcikge1xuICAgICAgTkVYVCA9IGZyYW1lYnVmZmVyLmFwcGVuZChlbnYsIHNjb3BlKVxuICAgIH0gZWxzZSB7XG4gICAgICBORVhUID0gc2NvcGUuZGVmKEZSQU1FQlVGRkVSX1NUQVRFLCAnLm5leHQnKVxuICAgIH1cblxuICAgIGlmICghc2tpcENoZWNrKSB7XG4gICAgICBzY29wZSgnaWYoJywgTkVYVCwgJyE9PScsIEZSQU1FQlVGRkVSX1NUQVRFLCAnLmN1cil7JylcbiAgICB9XG4gICAgc2NvcGUoXG4gICAgICAnaWYoJywgTkVYVCwgJyl7JyxcbiAgICAgIEdMLCAnLmJpbmRGcmFtZWJ1ZmZlcignLCBHTF9GUkFNRUJVRkZFUiwgJywnLCBORVhULCAnLmZyYW1lYnVmZmVyKTsnKVxuICAgIGlmIChleHREcmF3QnVmZmVycykge1xuICAgICAgc2NvcGUoRVhUX0RSQVdfQlVGRkVSUywgJy5kcmF3QnVmZmVyc1dFQkdMKCcsXG4gICAgICAgIERSQVdfQlVGRkVSUywgJ1snLCBORVhULCAnLmNvbG9yQXR0YWNobWVudHMubGVuZ3RoXSk7JylcbiAgICB9XG4gICAgc2NvcGUoJ31lbHNleycsXG4gICAgICBHTCwgJy5iaW5kRnJhbWVidWZmZXIoJywgR0xfRlJBTUVCVUZGRVIsICcsbnVsbCk7JylcbiAgICBpZiAoZXh0RHJhd0J1ZmZlcnMpIHtcbiAgICAgIHNjb3BlKEVYVF9EUkFXX0JVRkZFUlMsICcuZHJhd0J1ZmZlcnNXRUJHTCgnLCBCQUNLX0JVRkZFUiwgJyk7JylcbiAgICB9XG4gICAgc2NvcGUoXG4gICAgICAnfScsXG4gICAgICBGUkFNRUJVRkZFUl9TVEFURSwgJy5jdXI9JywgTkVYVCwgJzsnKVxuICAgIGlmICghc2tpcENoZWNrKSB7XG4gICAgICBzY29wZSgnfScpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdFBvbGxTdGF0ZSAoZW52LCBzY29wZSwgYXJncykge1xuICAgIHZhciBzaGFyZWQgPSBlbnYuc2hhcmVkXG5cbiAgICB2YXIgR0wgPSBzaGFyZWQuZ2xcblxuICAgIHZhciBDVVJSRU5UX1ZBUlMgPSBlbnYuY3VycmVudFxuICAgIHZhciBORVhUX1ZBUlMgPSBlbnYubmV4dFxuICAgIHZhciBDVVJSRU5UX1NUQVRFID0gc2hhcmVkLmN1cnJlbnRcbiAgICB2YXIgTkVYVF9TVEFURSA9IHNoYXJlZC5uZXh0XG5cbiAgICB2YXIgYmxvY2sgPSBlbnYuY29uZChDVVJSRU5UX1NUQVRFLCAnLmRpcnR5JylcblxuICAgIEdMX1NUQVRFX05BTUVTLmZvckVhY2goZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgIHZhciBwYXJhbSA9IHByb3BOYW1lKHByb3ApXG4gICAgICBpZiAocGFyYW0gaW4gYXJncy5zdGF0ZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdmFyIE5FWFQsIENVUlJFTlRcbiAgICAgIGlmIChwYXJhbSBpbiBORVhUX1ZBUlMpIHtcbiAgICAgICAgTkVYVCA9IE5FWFRfVkFSU1twYXJhbV1cbiAgICAgICAgQ1VSUkVOVCA9IENVUlJFTlRfVkFSU1twYXJhbV1cbiAgICAgICAgdmFyIHBhcnRzID0gbG9vcChjdXJyZW50U3RhdGVbcGFyYW1dLmxlbmd0aCwgZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICByZXR1cm4gYmxvY2suZGVmKE5FWFQsICdbJywgaSwgJ10nKVxuICAgICAgICB9KVxuICAgICAgICBibG9jayhlbnYuY29uZChwYXJ0cy5tYXAoZnVuY3Rpb24gKHAsIGkpIHtcbiAgICAgICAgICByZXR1cm4gcCArICchPT0nICsgQ1VSUkVOVCArICdbJyArIGkgKyAnXSdcbiAgICAgICAgfSkuam9pbignfHwnKSlcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIEdMLCAnLicsIEdMX1ZBUklBQkxFU1twYXJhbV0sICcoJywgcGFydHMsICcpOycsXG4gICAgICAgICAgICBwYXJ0cy5tYXAoZnVuY3Rpb24gKHAsIGkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIENVUlJFTlQgKyAnWycgKyBpICsgJ109JyArIHBcbiAgICAgICAgICAgIH0pLmpvaW4oJzsnKSwgJzsnKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE5FWFQgPSBibG9jay5kZWYoTkVYVF9TVEFURSwgJy4nLCBwYXJhbSlcbiAgICAgICAgdmFyIGlmdGUgPSBlbnYuY29uZChORVhULCAnIT09JywgQ1VSUkVOVF9TVEFURSwgJy4nLCBwYXJhbSlcbiAgICAgICAgYmxvY2soaWZ0ZSlcbiAgICAgICAgaWYgKHBhcmFtIGluIEdMX0ZMQUdTKSB7XG4gICAgICAgICAgaWZ0ZShcbiAgICAgICAgICAgIGVudi5jb25kKE5FWFQpXG4gICAgICAgICAgICAgICAgLnRoZW4oR0wsICcuZW5hYmxlKCcsIEdMX0ZMQUdTW3BhcmFtXSwgJyk7JylcbiAgICAgICAgICAgICAgICAuZWxzZShHTCwgJy5kaXNhYmxlKCcsIEdMX0ZMQUdTW3BhcmFtXSwgJyk7JyksXG4gICAgICAgICAgICBDVVJSRU5UX1NUQVRFLCAnLicsIHBhcmFtLCAnPScsIE5FWFQsICc7JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZnRlKFxuICAgICAgICAgICAgR0wsICcuJywgR0xfVkFSSUFCTEVTW3BhcmFtXSwgJygnLCBORVhULCAnKTsnLFxuICAgICAgICAgICAgQ1VSUkVOVF9TVEFURSwgJy4nLCBwYXJhbSwgJz0nLCBORVhULCAnOycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIGlmIChPYmplY3Qua2V5cyhhcmdzLnN0YXRlKS5sZW5ndGggPT09IDApIHtcbiAgICAgIGJsb2NrKENVUlJFTlRfU1RBVEUsICcuZGlydHk9ZmFsc2U7JylcbiAgICB9XG4gICAgc2NvcGUoYmxvY2spXG4gIH1cblxuICBmdW5jdGlvbiBlbWl0U2V0T3B0aW9ucyAoZW52LCBzY29wZSwgb3B0aW9ucywgZmlsdGVyKSB7XG4gICAgdmFyIHNoYXJlZCA9IGVudi5zaGFyZWRcbiAgICB2YXIgQ1VSUkVOVF9WQVJTID0gZW52LmN1cnJlbnRcbiAgICB2YXIgQ1VSUkVOVF9TVEFURSA9IHNoYXJlZC5jdXJyZW50XG4gICAgdmFyIEdMID0gc2hhcmVkLmdsXG4gICAgc29ydFN0YXRlKE9iamVjdC5rZXlzKG9wdGlvbnMpKS5mb3JFYWNoKGZ1bmN0aW9uIChwYXJhbSkge1xuICAgICAgdmFyIGRlZm4gPSBvcHRpb25zW3BhcmFtXVxuICAgICAgaWYgKGZpbHRlciAmJiAhZmlsdGVyKGRlZm4pKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdmFyIHZhcmlhYmxlID0gZGVmbi5hcHBlbmQoZW52LCBzY29wZSlcbiAgICAgIGlmIChHTF9GTEFHU1twYXJhbV0pIHtcbiAgICAgICAgdmFyIGZsYWcgPSBHTF9GTEFHU1twYXJhbV1cbiAgICAgICAgaWYgKGlzU3RhdGljKGRlZm4pKSB7XG4gICAgICAgICAgaWYgKHZhcmlhYmxlKSB7XG4gICAgICAgICAgICBzY29wZShHTCwgJy5lbmFibGUoJywgZmxhZywgJyk7JylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2NvcGUoR0wsICcuZGlzYWJsZSgnLCBmbGFnLCAnKTsnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzY29wZShlbnYuY29uZCh2YXJpYWJsZSlcbiAgICAgICAgICAgIC50aGVuKEdMLCAnLmVuYWJsZSgnLCBmbGFnLCAnKTsnKVxuICAgICAgICAgICAgLmVsc2UoR0wsICcuZGlzYWJsZSgnLCBmbGFnLCAnKTsnKSlcbiAgICAgICAgfVxuICAgICAgICBzY29wZShDVVJSRU5UX1NUQVRFLCAnLicsIHBhcmFtLCAnPScsIHZhcmlhYmxlLCAnOycpXG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXlMaWtlKHZhcmlhYmxlKSkge1xuICAgICAgICB2YXIgQ1VSUkVOVCA9IENVUlJFTlRfVkFSU1twYXJhbV1cbiAgICAgICAgc2NvcGUoXG4gICAgICAgICAgR0wsICcuJywgR0xfVkFSSUFCTEVTW3BhcmFtXSwgJygnLCB2YXJpYWJsZSwgJyk7JyxcbiAgICAgICAgICB2YXJpYWJsZS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiBDVVJSRU5UICsgJ1snICsgaSArICddPScgKyB2XG4gICAgICAgICAgfSkuam9pbignOycpLCAnOycpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY29wZShcbiAgICAgICAgICBHTCwgJy4nLCBHTF9WQVJJQUJMRVNbcGFyYW1dLCAnKCcsIHZhcmlhYmxlLCAnKTsnLFxuICAgICAgICAgIENVUlJFTlRfU1RBVEUsICcuJywgcGFyYW0sICc9JywgdmFyaWFibGUsICc7JylcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gaW5qZWN0RXh0ZW5zaW9ucyAoZW52LCBzY29wZSkge1xuICAgIGlmIChleHRJbnN0YW5jaW5nICYmICFlbnYuaW5zdGFuY2luZykge1xuICAgICAgZW52Lmluc3RhbmNpbmcgPSBzY29wZS5kZWYoXG4gICAgICAgIGVudi5zaGFyZWQuZXh0ZW5zaW9ucywgJy5hbmdsZV9pbnN0YW5jZWRfYXJyYXlzJylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbWl0UHJvZmlsZSAoZW52LCBzY29wZSwgYXJncywgdXNlU2NvcGUsIGluY3JlbWVudENvdW50ZXIpIHtcbiAgICB2YXIgc2hhcmVkID0gZW52LnNoYXJlZFxuICAgIHZhciBTVEFUUyA9IGVudi5zdGF0c1xuICAgIHZhciBDVVJSRU5UX1NUQVRFID0gc2hhcmVkLmN1cnJlbnRcbiAgICB2YXIgVElNRVIgPSBzaGFyZWQudGltZXJcbiAgICB2YXIgcHJvZmlsZUFyZyA9IGFyZ3MucHJvZmlsZVxuXG4gICAgZnVuY3Rpb24gcGVyZkNvdW50ZXIgKCkge1xuICAgICAgaWYgKHR5cGVvZiBwZXJmb3JtYW5jZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuICdEYXRlLm5vdygpJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICdwZXJmb3JtYW5jZS5ub3coKSdcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgQ1BVX1NUQVJULCBRVUVSWV9DT1VOVEVSXG4gICAgZnVuY3Rpb24gZW1pdFByb2ZpbGVTdGFydCAoYmxvY2spIHtcbiAgICAgIENQVV9TVEFSVCA9IHNjb3BlLmRlZigpXG4gICAgICBibG9jayhDUFVfU1RBUlQsICc9JywgcGVyZkNvdW50ZXIoKSwgJzsnKVxuICAgICAgaWYgKHR5cGVvZiBpbmNyZW1lbnRDb3VudGVyID09PSAnc3RyaW5nJykge1xuICAgICAgICBibG9jayhTVEFUUywgJy5jb3VudCs9JywgaW5jcmVtZW50Q291bnRlciwgJzsnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmxvY2soU1RBVFMsICcuY291bnQrKzsnKVxuICAgICAgfVxuICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgIGlmICh1c2VTY29wZSkge1xuICAgICAgICAgIFFVRVJZX0NPVU5URVIgPSBzY29wZS5kZWYoKVxuICAgICAgICAgIGJsb2NrKFFVRVJZX0NPVU5URVIsICc9JywgVElNRVIsICcuZ2V0TnVtUGVuZGluZ1F1ZXJpZXMoKTsnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJsb2NrKFRJTUVSLCAnLmJlZ2luUXVlcnkoJywgU1RBVFMsICcpOycpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbWl0UHJvZmlsZUVuZCAoYmxvY2spIHtcbiAgICAgIGJsb2NrKFNUQVRTLCAnLmNwdVRpbWUrPScsIHBlcmZDb3VudGVyKCksICctJywgQ1BVX1NUQVJULCAnOycpXG4gICAgICBpZiAodGltZXIpIHtcbiAgICAgICAgaWYgKHVzZVNjb3BlKSB7XG4gICAgICAgICAgYmxvY2soVElNRVIsICcucHVzaFNjb3BlU3RhdHMoJyxcbiAgICAgICAgICAgIFFVRVJZX0NPVU5URVIsICcsJyxcbiAgICAgICAgICAgIFRJTUVSLCAnLmdldE51bVBlbmRpbmdRdWVyaWVzKCksJyxcbiAgICAgICAgICAgIFNUQVRTLCAnKTsnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJsb2NrKFRJTUVSLCAnLmVuZFF1ZXJ5KCk7JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNjb3BlUHJvZmlsZSAodmFsdWUpIHtcbiAgICAgIHZhciBwcmV2ID0gc2NvcGUuZGVmKENVUlJFTlRfU1RBVEUsICcucHJvZmlsZScpXG4gICAgICBzY29wZShDVVJSRU5UX1NUQVRFLCAnLnByb2ZpbGU9JywgdmFsdWUsICc7JylcbiAgICAgIHNjb3BlLmV4aXQoQ1VSUkVOVF9TVEFURSwgJy5wcm9maWxlPScsIHByZXYsICc7JylcbiAgICB9XG5cbiAgICB2YXIgVVNFX1BST0ZJTEVcbiAgICBpZiAocHJvZmlsZUFyZykge1xuICAgICAgaWYgKGlzU3RhdGljKHByb2ZpbGVBcmcpKSB7XG4gICAgICAgIGlmIChwcm9maWxlQXJnLmVuYWJsZSkge1xuICAgICAgICAgIGVtaXRQcm9maWxlU3RhcnQoc2NvcGUpXG4gICAgICAgICAgZW1pdFByb2ZpbGVFbmQoc2NvcGUuZXhpdClcbiAgICAgICAgICBzY29wZVByb2ZpbGUoJ3RydWUnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNjb3BlUHJvZmlsZSgnZmFsc2UnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgVVNFX1BST0ZJTEUgPSBwcm9maWxlQXJnLmFwcGVuZChlbnYsIHNjb3BlKVxuICAgICAgc2NvcGVQcm9maWxlKFVTRV9QUk9GSUxFKVxuICAgIH0gZWxzZSB7XG4gICAgICBVU0VfUFJPRklMRSA9IHNjb3BlLmRlZihDVVJSRU5UX1NUQVRFLCAnLnByb2ZpbGUnKVxuICAgIH1cblxuICAgIHZhciBzdGFydCA9IGVudi5ibG9jaygpXG4gICAgZW1pdFByb2ZpbGVTdGFydChzdGFydClcbiAgICBzY29wZSgnaWYoJywgVVNFX1BST0ZJTEUsICcpeycsIHN0YXJ0LCAnfScpXG4gICAgdmFyIGVuZCA9IGVudi5ibG9jaygpXG4gICAgZW1pdFByb2ZpbGVFbmQoZW5kKVxuICAgIHNjb3BlLmV4aXQoJ2lmKCcsIFVTRV9QUk9GSUxFLCAnKXsnLCBlbmQsICd9JylcbiAgfVxuXG4gIGZ1bmN0aW9uIGVtaXRBdHRyaWJ1dGVzIChlbnYsIHNjb3BlLCBhcmdzLCBhdHRyaWJ1dGVzLCBmaWx0ZXIpIHtcbiAgICB2YXIgc2hhcmVkID0gZW52LnNoYXJlZFxuXG4gICAgZnVuY3Rpb24gdHlwZUxlbmd0aCAoeCkge1xuICAgICAgc3dpdGNoICh4KSB7XG4gICAgICAgIGNhc2UgR0xfRkxPQVRfVkVDMjpcbiAgICAgICAgY2FzZSBHTF9JTlRfVkVDMjpcbiAgICAgICAgY2FzZSBHTF9CT09MX1ZFQzI6XG4gICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgY2FzZSBHTF9GTE9BVF9WRUMzOlxuICAgICAgICBjYXNlIEdMX0lOVF9WRUMzOlxuICAgICAgICBjYXNlIEdMX0JPT0xfVkVDMzpcbiAgICAgICAgICByZXR1cm4gM1xuICAgICAgICBjYXNlIEdMX0ZMT0FUX1ZFQzQ6XG4gICAgICAgIGNhc2UgR0xfSU5UX1ZFQzQ6XG4gICAgICAgIGNhc2UgR0xfQk9PTF9WRUM0OlxuICAgICAgICAgIHJldHVybiA0XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbWl0QmluZEF0dHJpYnV0ZSAoQVRUUklCVVRFLCBzaXplLCByZWNvcmQpIHtcbiAgICAgIHZhciBHTCA9IHNoYXJlZC5nbFxuXG4gICAgICB2YXIgTE9DQVRJT04gPSBzY29wZS5kZWYoQVRUUklCVVRFLCAnLmxvY2F0aW9uJylcbiAgICAgIHZhciBCSU5ESU5HID0gc2NvcGUuZGVmKHNoYXJlZC5hdHRyaWJ1dGVzLCAnWycsIExPQ0FUSU9OLCAnXScpXG5cbiAgICAgIHZhciBTVEFURSA9IHJlY29yZC5zdGF0ZVxuICAgICAgdmFyIEJVRkZFUiA9IHJlY29yZC5idWZmZXJcbiAgICAgIHZhciBDT05TVF9DT01QT05FTlRTID0gW1xuICAgICAgICByZWNvcmQueCxcbiAgICAgICAgcmVjb3JkLnksXG4gICAgICAgIHJlY29yZC56LFxuICAgICAgICByZWNvcmQud1xuICAgICAgXVxuXG4gICAgICB2YXIgQ09NTU9OX0tFWVMgPSBbXG4gICAgICAgICdidWZmZXInLFxuICAgICAgICAnbm9ybWFsaXplZCcsXG4gICAgICAgICdvZmZzZXQnLFxuICAgICAgICAnc3RyaWRlJ1xuICAgICAgXVxuXG4gICAgICBmdW5jdGlvbiBlbWl0QnVmZmVyICgpIHtcbiAgICAgICAgc2NvcGUoXG4gICAgICAgICAgJ2lmKCEnLCBCSU5ESU5HLCAnLmJ1ZmZlcil7JyxcbiAgICAgICAgICBHTCwgJy5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgnLCBMT0NBVElPTiwgJyk7fScpXG5cbiAgICAgICAgdmFyIFRZUEUgPSByZWNvcmQudHlwZVxuICAgICAgICB2YXIgU0laRVxuICAgICAgICBpZiAoIXJlY29yZC5zaXplKSB7XG4gICAgICAgICAgU0laRSA9IHNpemVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBTSVpFID0gc2NvcGUuZGVmKHJlY29yZC5zaXplLCAnfHwnLCBzaXplKVxuICAgICAgICB9XG5cbiAgICAgICAgc2NvcGUoJ2lmKCcsXG4gICAgICAgICAgQklORElORywgJy50eXBlIT09JywgVFlQRSwgJ3x8JyxcbiAgICAgICAgICBCSU5ESU5HLCAnLnNpemUhPT0nLCBTSVpFLCAnfHwnLFxuICAgICAgICAgIENPTU1PTl9LRVlTLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gQklORElORyArICcuJyArIGtleSArICchPT0nICsgcmVjb3JkW2tleV1cbiAgICAgICAgICB9KS5qb2luKCd8fCcpLFxuICAgICAgICAgICcpeycsXG4gICAgICAgICAgR0wsICcuYmluZEJ1ZmZlcignLCBHTF9BUlJBWV9CVUZGRVIsICcsJywgQlVGRkVSLCAnLmJ1ZmZlcik7JyxcbiAgICAgICAgICBHTCwgJy52ZXJ0ZXhBdHRyaWJQb2ludGVyKCcsIFtcbiAgICAgICAgICAgIExPQ0FUSU9OLFxuICAgICAgICAgICAgU0laRSxcbiAgICAgICAgICAgIFRZUEUsXG4gICAgICAgICAgICByZWNvcmQubm9ybWFsaXplZCxcbiAgICAgICAgICAgIHJlY29yZC5zdHJpZGUsXG4gICAgICAgICAgICByZWNvcmQub2Zmc2V0XG4gICAgICAgICAgXSwgJyk7JyxcbiAgICAgICAgICBCSU5ESU5HLCAnLnR5cGU9JywgVFlQRSwgJzsnLFxuICAgICAgICAgIEJJTkRJTkcsICcuc2l6ZT0nLCBTSVpFLCAnOycsXG4gICAgICAgICAgQ09NTU9OX0tFWVMubWFwKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBCSU5ESU5HICsgJy4nICsga2V5ICsgJz0nICsgcmVjb3JkW2tleV0gKyAnOydcbiAgICAgICAgICB9KS5qb2luKCcnKSxcbiAgICAgICAgICAnfScpXG5cbiAgICAgICAgaWYgKGV4dEluc3RhbmNpbmcpIHtcbiAgICAgICAgICB2YXIgRElWSVNPUiA9IHJlY29yZC5kaXZpc29yXG4gICAgICAgICAgc2NvcGUoXG4gICAgICAgICAgICAnaWYoJywgQklORElORywgJy5kaXZpc29yIT09JywgRElWSVNPUiwgJyl7JyxcbiAgICAgICAgICAgIGVudi5pbnN0YW5jaW5nLCAnLnZlcnRleEF0dHJpYkRpdmlzb3JBTkdMRSgnLCBbTE9DQVRJT04sIERJVklTT1JdLCAnKTsnLFxuICAgICAgICAgICAgQklORElORywgJy5kaXZpc29yPScsIERJVklTT1IsICc7fScpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZW1pdENvbnN0YW50ICgpIHtcbiAgICAgICAgc2NvcGUoXG4gICAgICAgICAgJ2lmKCcsIEJJTkRJTkcsICcuYnVmZmVyKXsnLFxuICAgICAgICAgIEdMLCAnLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSgnLCBMT0NBVElPTiwgJyk7JyxcbiAgICAgICAgICAnfWlmKCcsIENVVEVfQ09NUE9ORU5UUy5tYXAoZnVuY3Rpb24gKGMsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiBCSU5ESU5HICsgJy4nICsgYyArICchPT0nICsgQ09OU1RfQ09NUE9ORU5UU1tpXVxuICAgICAgICAgIH0pLmpvaW4oJ3x8JyksICcpeycsXG4gICAgICAgICAgR0wsICcudmVydGV4QXR0cmliNGYoJywgTE9DQVRJT04sICcsJywgQ09OU1RfQ09NUE9ORU5UUywgJyk7JyxcbiAgICAgICAgICBDVVRFX0NPTVBPTkVOVFMubWFwKGZ1bmN0aW9uIChjLCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gQklORElORyArICcuJyArIGMgKyAnPScgKyBDT05TVF9DT01QT05FTlRTW2ldICsgJzsnXG4gICAgICAgICAgfSkuam9pbignJyksXG4gICAgICAgICAgJ30nKVxuICAgICAgfVxuXG4gICAgICBpZiAoU1RBVEUgPT09IEFUVFJJQl9TVEFURV9QT0lOVEVSKSB7XG4gICAgICAgIGVtaXRCdWZmZXIoKVxuICAgICAgfSBlbHNlIGlmIChTVEFURSA9PT0gQVRUUklCX1NUQVRFX0NPTlNUQU5UKSB7XG4gICAgICAgIGVtaXRDb25zdGFudCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY29wZSgnaWYoJywgU1RBVEUsICc9PT0nLCBBVFRSSUJfU1RBVEVfUE9JTlRFUiwgJyl7JylcbiAgICAgICAgZW1pdEJ1ZmZlcigpXG4gICAgICAgIHNjb3BlKCd9ZWxzZXsnKVxuICAgICAgICBlbWl0Q29uc3RhbnQoKVxuICAgICAgICBzY29wZSgnfScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChhdHRyaWJ1dGUpIHtcbiAgICAgIHZhciBuYW1lID0gYXR0cmlidXRlLm5hbWVcbiAgICAgIHZhciBhcmcgPSBhcmdzLmF0dHJpYnV0ZXNbbmFtZV1cbiAgICAgIHZhciByZWNvcmRcbiAgICAgIGlmIChhcmcpIHtcbiAgICAgICAgaWYgKCFmaWx0ZXIoYXJnKSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHJlY29yZCA9IGFyZy5hcHBlbmQoZW52LCBzY29wZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghZmlsdGVyKFNDT1BFX0RFQ0wpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNjb3BlQXR0cmliID0gZW52LnNjb3BlQXR0cmliKG5hbWUpXG4gICAgICAgIFxuICAgICAgICByZWNvcmQgPSB7fVxuICAgICAgICBPYmplY3Qua2V5cyhuZXcgQXR0cmlidXRlUmVjb3JkKCkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgIHJlY29yZFtrZXldID0gc2NvcGUuZGVmKHNjb3BlQXR0cmliLCAnLicsIGtleSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGVtaXRCaW5kQXR0cmlidXRlKFxuICAgICAgICBlbnYubGluayhhdHRyaWJ1dGUpLCB0eXBlTGVuZ3RoKGF0dHJpYnV0ZS5pbmZvLnR5cGUpLCByZWNvcmQpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGVtaXRVbmlmb3JtcyAoZW52LCBzY29wZSwgYXJncywgdW5pZm9ybXMsIGZpbHRlcikge1xuICAgIHZhciBzaGFyZWQgPSBlbnYuc2hhcmVkXG4gICAgdmFyIEdMID0gc2hhcmVkLmdsXG5cbiAgICB2YXIgaW5maXhcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVuaWZvcm1zLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgdW5pZm9ybSA9IHVuaWZvcm1zW2ldXG4gICAgICB2YXIgbmFtZSA9IHVuaWZvcm0ubmFtZVxuICAgICAgdmFyIHR5cGUgPSB1bmlmb3JtLmluZm8udHlwZVxuICAgICAgdmFyIGFyZyA9IGFyZ3MudW5pZm9ybXNbbmFtZV1cbiAgICAgIHZhciBVTklGT1JNID0gZW52LmxpbmsodW5pZm9ybSlcbiAgICAgIHZhciBMT0NBVElPTiA9IFVOSUZPUk0gKyAnLmxvY2F0aW9uJ1xuXG4gICAgICB2YXIgVkFMVUVcbiAgICAgIGlmIChhcmcpIHtcbiAgICAgICAgaWYgKCFmaWx0ZXIoYXJnKSkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzU3RhdGljKGFyZykpIHtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBhcmcudmFsdWVcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAodHlwZSA9PT0gR0xfU0FNUExFUl8yRCB8fCB0eXBlID09PSBHTF9TQU1QTEVSX0NVQkUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIFRFWF9WQUxVRSA9IGVudi5saW5rKHZhbHVlLl90ZXh0dXJlIHx8IHZhbHVlLmNvbG9yWzBdLl90ZXh0dXJlKVxuICAgICAgICAgICAgc2NvcGUoR0wsICcudW5pZm9ybTFpKCcsIExPQ0FUSU9OLCAnLCcsIFRFWF9WQUxVRSArICcuYmluZCgpKTsnKVxuICAgICAgICAgICAgc2NvcGUuZXhpdChURVhfVkFMVUUsICcudW5iaW5kKCk7JylcbiAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgdHlwZSA9PT0gR0xfRkxPQVRfTUFUMiB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gR0xfRkxPQVRfTUFUMyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gR0xfRkxPQVRfTUFUNCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgTUFUX1ZBTFVFID0gZW52Lmdsb2JhbC5kZWYoJ25ldyBGbG9hdDMyQXJyYXkoWycgK1xuICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh2YWx1ZSkgKyAnXSknKVxuICAgICAgICAgICAgdmFyIGRpbSA9IDJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBHTF9GTE9BVF9NQVQzKSB7XG4gICAgICAgICAgICAgIGRpbSA9IDNcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gR0xfRkxPQVRfTUFUNCkge1xuICAgICAgICAgICAgICBkaW0gPSA0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzY29wZShcbiAgICAgICAgICAgICAgR0wsICcudW5pZm9ybU1hdHJpeCcsIGRpbSwgJ2Z2KCcsXG4gICAgICAgICAgICAgIExPQ0FUSU9OLCAnLGZhbHNlLCcsIE1BVF9WQUxVRSwgJyk7JylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgIGNhc2UgR0xfRkxPQVQ6XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW5maXggPSAnMWYnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgY2FzZSBHTF9GTE9BVF9WRUMyOlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGluZml4ID0gJzJmJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIGNhc2UgR0xfRkxPQVRfVkVDMzpcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbmZpeCA9ICczZidcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICBjYXNlIEdMX0ZMT0FUX1ZFQzQ6XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW5maXggPSAnNGYnXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgY2FzZSBHTF9CT09MOlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGluZml4ID0gJzFpJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIGNhc2UgR0xfSU5UOlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGluZml4ID0gJzFpJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIGNhc2UgR0xfQk9PTF9WRUMyOlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGluZml4ID0gJzJpJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIGNhc2UgR0xfSU5UX1ZFQzI6XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW5maXggPSAnMmknXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgY2FzZSBHTF9CT09MX1ZFQzM6XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaW5maXggPSAnM2knXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgY2FzZSBHTF9JTlRfVkVDMzpcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbmZpeCA9ICczaSdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICBjYXNlIEdMX0JPT0xfVkVDNDpcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpbmZpeCA9ICc0aSdcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICBjYXNlIEdMX0lOVF9WRUM0OlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGluZml4ID0gJzRpJ1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzY29wZShHTCwgJy51bmlmb3JtJywgaW5maXgsICcoJywgTE9DQVRJT04sICcsJyxcbiAgICAgICAgICAgICAgaXNBcnJheUxpa2UodmFsdWUpID8gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodmFsdWUpIDogdmFsdWUsXG4gICAgICAgICAgICAgICcpOycpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgVkFMVUUgPSBhcmcuYXBwZW5kKGVudiwgc2NvcGUpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghZmlsdGVyKFNDT1BFX0RFQ0wpKSB7XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICBWQUxVRSA9IHNjb3BlLmRlZihzaGFyZWQudW5pZm9ybXMsICdbJywgc3RyaW5nU3RvcmUuaWQobmFtZSksICddJylcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT09IEdMX1NBTVBMRVJfMkQpIHtcbiAgICAgICAgc2NvcGUoXG4gICAgICAgICAgJ2lmKCcsIFZBTFVFLCAnJiYnLCBWQUxVRSwgJy5fcmVnbFR5cGU9PT1cImZyYW1lYnVmZmVyXCIpeycsXG4gICAgICAgICAgVkFMVUUsICc9JywgVkFMVUUsICcuY29sb3JbMF07JyxcbiAgICAgICAgICAnfScpXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IEdMX1NBTVBMRVJfQ1VCRSkge1xuICAgICAgICBzY29wZShcbiAgICAgICAgICAnaWYoJywgVkFMVUUsICcmJicsIFZBTFVFLCAnLl9yZWdsVHlwZT09PVwiZnJhbWVidWZmZXJDdWJlXCIpeycsXG4gICAgICAgICAgVkFMVUUsICc9JywgVkFMVUUsICcuY29sb3JbMF07JyxcbiAgICAgICAgICAnfScpXG4gICAgICB9XG5cbiAgICAgIC8vIHBlcmZvcm0gdHlwZSB2YWxpZGF0aW9uXG4gICAgICBcblxuICAgICAgdmFyIHVucm9sbCA9IDFcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIEdMX1NBTVBMRVJfMkQ6XG4gICAgICAgIGNhc2UgR0xfU0FNUExFUl9DVUJFOlxuICAgICAgICAgIHZhciBURVggPSBzY29wZS5kZWYoVkFMVUUsICcuX3RleHR1cmUnKVxuICAgICAgICAgIHNjb3BlKEdMLCAnLnVuaWZvcm0xaSgnLCBMT0NBVElPTiwgJywnLCBURVgsICcuYmluZCgpKTsnKVxuICAgICAgICAgIHNjb3BlLmV4aXQoVEVYLCAnLnVuYmluZCgpOycpXG4gICAgICAgICAgY29udGludWVcblxuICAgICAgICBjYXNlIEdMX0lOVDpcbiAgICAgICAgY2FzZSBHTF9CT09MOlxuICAgICAgICAgIGluZml4ID0gJzFpJ1xuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBHTF9JTlRfVkVDMjpcbiAgICAgICAgY2FzZSBHTF9CT09MX1ZFQzI6XG4gICAgICAgICAgaW5maXggPSAnMmknXG4gICAgICAgICAgdW5yb2xsID0gMlxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBHTF9JTlRfVkVDMzpcbiAgICAgICAgY2FzZSBHTF9CT09MX1ZFQzM6XG4gICAgICAgICAgaW5maXggPSAnM2knXG4gICAgICAgICAgdW5yb2xsID0gM1xuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBHTF9JTlRfVkVDNDpcbiAgICAgICAgY2FzZSBHTF9CT09MX1ZFQzQ6XG4gICAgICAgICAgaW5maXggPSAnNGknXG4gICAgICAgICAgdW5yb2xsID0gNFxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBHTF9GTE9BVDpcbiAgICAgICAgICBpbmZpeCA9ICcxZidcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgR0xfRkxPQVRfVkVDMjpcbiAgICAgICAgICBpbmZpeCA9ICcyZidcbiAgICAgICAgICB1bnJvbGwgPSAyXG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlIEdMX0ZMT0FUX1ZFQzM6XG4gICAgICAgICAgaW5maXggPSAnM2YnXG4gICAgICAgICAgdW5yb2xsID0gM1xuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBHTF9GTE9BVF9WRUM0OlxuICAgICAgICAgIGluZml4ID0gJzRmJ1xuICAgICAgICAgIHVucm9sbCA9IDRcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgR0xfRkxPQVRfTUFUMjpcbiAgICAgICAgICBpbmZpeCA9ICdNYXRyaXgyZnYnXG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlIEdMX0ZMT0FUX01BVDM6XG4gICAgICAgICAgaW5maXggPSAnTWF0cml4M2Z2J1xuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBHTF9GTE9BVF9NQVQ0OlxuICAgICAgICAgIGluZml4ID0gJ01hdHJpeDRmdidcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBzY29wZShHTCwgJy51bmlmb3JtJywgaW5maXgsICcoJywgTE9DQVRJT04sICcsJylcbiAgICAgIGlmIChpbmZpeC5jaGFyQXQoMCkgPT09ICdNJykge1xuICAgICAgICB2YXIgbWF0U2l6ZSA9IE1hdGgucG93KHR5cGUgLSBHTF9GTE9BVF9NQVQyICsgMiwgMilcbiAgICAgICAgdmFyIFNUT1JBR0UgPSBlbnYuZ2xvYmFsLmRlZignbmV3IEZsb2F0MzJBcnJheSgnLCBtYXRTaXplLCAnKScpXG4gICAgICAgIHNjb3BlKFxuICAgICAgICAgICdmYWxzZSwoQXJyYXkuaXNBcnJheSgnLCBWQUxVRSwgJyl8fCcsIFZBTFVFLCAnIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KT8nLCBWQUxVRSwgJzooJyxcbiAgICAgICAgICBsb29wKG1hdFNpemUsIGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICByZXR1cm4gU1RPUkFHRSArICdbJyArIGkgKyAnXT0nICsgVkFMVUUgKyAnWycgKyBpICsgJ10nXG4gICAgICAgICAgfSksICcsJywgU1RPUkFHRSwgJyknKVxuICAgICAgfSBlbHNlIGlmICh1bnJvbGwgPiAxKSB7XG4gICAgICAgIHNjb3BlKGxvb3AodW5yb2xsLCBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgIHJldHVybiBWQUxVRSArICdbJyArIGkgKyAnXSdcbiAgICAgICAgfSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY29wZShWQUxVRSlcbiAgICAgIH1cbiAgICAgIHNjb3BlKCcpOycpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdERyYXcgKGVudiwgb3V0ZXIsIGlubmVyLCBhcmdzKSB7XG4gICAgdmFyIHNoYXJlZCA9IGVudi5zaGFyZWRcbiAgICB2YXIgR0wgPSBzaGFyZWQuZ2xcbiAgICB2YXIgRFJBV19TVEFURSA9IHNoYXJlZC5kcmF3XG5cbiAgICB2YXIgZHJhd09wdGlvbnMgPSBhcmdzLmRyYXdcblxuICAgIGZ1bmN0aW9uIGVtaXRFbGVtZW50cyAoKSB7XG4gICAgICB2YXIgZGVmbiA9IGRyYXdPcHRpb25zLmVsZW1lbnRzXG4gICAgICB2YXIgRUxFTUVOVFNcbiAgICAgIHZhciBzY29wZSA9IG91dGVyXG4gICAgICBpZiAoZGVmbikge1xuICAgICAgICBpZiAoKGRlZm4uY29udGV4dERlcCAmJiBhcmdzLmNvbnRleHREeW5hbWljKSB8fCBkZWZuLnByb3BEZXApIHtcbiAgICAgICAgICBzY29wZSA9IGlubmVyXG4gICAgICAgIH1cbiAgICAgICAgRUxFTUVOVFMgPSBkZWZuLmFwcGVuZChlbnYsIHNjb3BlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgRUxFTUVOVFMgPSBzY29wZS5kZWYoRFJBV19TVEFURSwgJy4nLCBTX0VMRU1FTlRTKVxuICAgICAgfVxuICAgICAgaWYgKEVMRU1FTlRTKSB7XG4gICAgICAgIHNjb3BlKFxuICAgICAgICAgICdpZignICsgRUxFTUVOVFMgKyAnKScgK1xuICAgICAgICAgIEdMICsgJy5iaW5kQnVmZmVyKCcgKyBHTF9FTEVNRU5UX0FSUkFZX0JVRkZFUiArICcsJyArIEVMRU1FTlRTICsgJy5idWZmZXIuYnVmZmVyKTsnKVxuICAgICAgfVxuICAgICAgcmV0dXJuIEVMRU1FTlRTXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW1pdENvdW50ICgpIHtcbiAgICAgIHZhciBkZWZuID0gZHJhd09wdGlvbnMuY291bnRcbiAgICAgIHZhciBDT1VOVFxuICAgICAgdmFyIHNjb3BlID0gb3V0ZXJcbiAgICAgIGlmIChkZWZuKSB7XG4gICAgICAgIGlmICgoZGVmbi5jb250ZXh0RGVwICYmIGFyZ3MuY29udGV4dER5bmFtaWMpIHx8IGRlZm4ucHJvcERlcCkge1xuICAgICAgICAgIHNjb3BlID0gaW5uZXJcbiAgICAgICAgfVxuICAgICAgICBDT1VOVCA9IGRlZm4uYXBwZW5kKGVudiwgc2NvcGUpXG4gICAgICAgIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQ09VTlQgPSBzY29wZS5kZWYoRFJBV19TVEFURSwgJy4nLCBTX0NPVU5UKVxuICAgICAgICBcbiAgICAgIH1cbiAgICAgIHJldHVybiBDT1VOVFxuICAgIH1cblxuICAgIHZhciBFTEVNRU5UUyA9IGVtaXRFbGVtZW50cygpXG4gICAgZnVuY3Rpb24gZW1pdFZhbHVlIChuYW1lKSB7XG4gICAgICB2YXIgZGVmbiA9IGRyYXdPcHRpb25zW25hbWVdXG4gICAgICBpZiAoZGVmbikge1xuICAgICAgICBpZiAoKGRlZm4uY29udGV4dERlcCAmJiBhcmdzLmNvbnRleHREeW5hbWljKSB8fCBkZWZuLnByb3BEZXApIHtcbiAgICAgICAgICByZXR1cm4gZGVmbi5hcHBlbmQoZW52LCBpbm5lcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZGVmbi5hcHBlbmQoZW52LCBvdXRlcilcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG91dGVyLmRlZihEUkFXX1NUQVRFLCAnLicsIG5hbWUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIFBSSU1JVElWRSA9IGVtaXRWYWx1ZShTX1BSSU1JVElWRSlcbiAgICB2YXIgT0ZGU0VUID0gZW1pdFZhbHVlKFNfT0ZGU0VUKVxuXG4gICAgdmFyIENPVU5UID0gZW1pdENvdW50KClcbiAgICBpZiAodHlwZW9mIENPVU5UID09PSAnbnVtYmVyJykge1xuICAgICAgaWYgKENPVU5UID09PSAwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpbm5lcignaWYoJywgQ09VTlQsICcpeycpXG4gICAgICBpbm5lci5leGl0KCd9JylcbiAgICB9XG5cbiAgICB2YXIgSU5TVEFOQ0VTLCBFWFRfSU5TVEFOQ0lOR1xuICAgIGlmIChleHRJbnN0YW5jaW5nKSB7XG4gICAgICBJTlNUQU5DRVMgPSBlbWl0VmFsdWUoU19JTlNUQU5DRVMpXG4gICAgICBFWFRfSU5TVEFOQ0lORyA9IGVudi5pbnN0YW5jaW5nXG4gICAgfVxuXG4gICAgdmFyIEVMRU1FTlRfVFlQRSA9IEVMRU1FTlRTICsgJy50eXBlJ1xuXG4gICAgdmFyIGVsZW1lbnRzU3RhdGljID0gZHJhd09wdGlvbnMuZWxlbWVudHMgJiYgaXNTdGF0aWMoZHJhd09wdGlvbnMuZWxlbWVudHMpXG5cbiAgICBmdW5jdGlvbiBlbWl0SW5zdGFuY2luZyAoKSB7XG4gICAgICBmdW5jdGlvbiBkcmF3RWxlbWVudHMgKCkge1xuICAgICAgICBpbm5lcihFWFRfSU5TVEFOQ0lORywgJy5kcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSgnLCBbXG4gICAgICAgICAgUFJJTUlUSVZFLFxuICAgICAgICAgIENPVU5ULFxuICAgICAgICAgIEVMRU1FTlRfVFlQRSxcbiAgICAgICAgICBPRkZTRVQgKyAnPDwoKCcgKyBFTEVNRU5UX1RZUEUgKyAnLScgKyBHTF9VTlNJR05FRF9CWVRFICsgJyk+PjEpJyxcbiAgICAgICAgICBJTlNUQU5DRVNcbiAgICAgICAgXSwgJyk7JylcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZHJhd0FycmF5cyAoKSB7XG4gICAgICAgIGlubmVyKEVYVF9JTlNUQU5DSU5HLCAnLmRyYXdBcnJheXNJbnN0YW5jZWRBTkdMRSgnLFxuICAgICAgICAgIFtQUklNSVRJVkUsIE9GRlNFVCwgQ09VTlQsIElOU1RBTkNFU10sICcpOycpXG4gICAgICB9XG5cbiAgICAgIGlmIChFTEVNRU5UUykge1xuICAgICAgICBpZiAoIWVsZW1lbnRzU3RhdGljKSB7XG4gICAgICAgICAgaW5uZXIoJ2lmKCcsIEVMRU1FTlRTLCAnKXsnKVxuICAgICAgICAgIGRyYXdFbGVtZW50cygpXG4gICAgICAgICAgaW5uZXIoJ31lbHNleycpXG4gICAgICAgICAgZHJhd0FycmF5cygpXG4gICAgICAgICAgaW5uZXIoJ30nKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRyYXdFbGVtZW50cygpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRyYXdBcnJheXMoKVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVtaXRSZWd1bGFyICgpIHtcbiAgICAgIGZ1bmN0aW9uIGRyYXdFbGVtZW50cyAoKSB7XG4gICAgICAgIGlubmVyKEdMICsgJy5kcmF3RWxlbWVudHMoJyArIFtcbiAgICAgICAgICBQUklNSVRJVkUsXG4gICAgICAgICAgQ09VTlQsXG4gICAgICAgICAgRUxFTUVOVF9UWVBFLFxuICAgICAgICAgIE9GRlNFVCArICc8PCgoJyArIEVMRU1FTlRfVFlQRSArICctJyArIEdMX1VOU0lHTkVEX0JZVEUgKyAnKT4+MSknXG4gICAgICAgIF0gKyAnKTsnKVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBkcmF3QXJyYXlzICgpIHtcbiAgICAgICAgaW5uZXIoR0wgKyAnLmRyYXdBcnJheXMoJyArIFtQUklNSVRJVkUsIE9GRlNFVCwgQ09VTlRdICsgJyk7JylcbiAgICAgIH1cblxuICAgICAgaWYgKEVMRU1FTlRTKSB7XG4gICAgICAgIGlmICghZWxlbWVudHNTdGF0aWMpIHtcbiAgICAgICAgICBpbm5lcignaWYoJywgRUxFTUVOVFMsICcpeycpXG4gICAgICAgICAgZHJhd0VsZW1lbnRzKClcbiAgICAgICAgICBpbm5lcignfWVsc2V7JylcbiAgICAgICAgICBkcmF3QXJyYXlzKClcbiAgICAgICAgICBpbm5lcignfScpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZHJhd0VsZW1lbnRzKClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZHJhd0FycmF5cygpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGV4dEluc3RhbmNpbmcgJiYgKHR5cGVvZiBJTlNUQU5DRVMgIT09ICdudW1iZXInIHx8IElOU1RBTkNFUyA+PSAwKSkge1xuICAgICAgaWYgKHR5cGVvZiBJTlNUQU5DRVMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlubmVyKCdpZignLCBJTlNUQU5DRVMsICc+MCl7JylcbiAgICAgICAgZW1pdEluc3RhbmNpbmcoKVxuICAgICAgICBpbm5lcignfWVsc2UgaWYoJywgSU5TVEFOQ0VTLCAnPDApeycpXG4gICAgICAgIGVtaXRSZWd1bGFyKClcbiAgICAgICAgaW5uZXIoJ30nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW1pdEluc3RhbmNpbmcoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0UmVndWxhcigpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQm9keSAoZW1pdEJvZHksIHBhcmVudEVudiwgYXJncywgcHJvZ3JhbSwgY291bnQpIHtcbiAgICB2YXIgZW52ID0gY3JlYXRlUkVHTEVudmlyb25tZW50KClcbiAgICB2YXIgc2NvcGUgPSBlbnYucHJvYygnYm9keScsIGNvdW50KVxuICAgIFxuICAgIGlmIChleHRJbnN0YW5jaW5nKSB7XG4gICAgICBlbnYuaW5zdGFuY2luZyA9IHNjb3BlLmRlZihcbiAgICAgICAgZW52LnNoYXJlZC5leHRlbnNpb25zLCAnLmFuZ2xlX2luc3RhbmNlZF9hcnJheXMnKVxuICAgIH1cbiAgICBlbWl0Qm9keShlbnYsIHNjb3BlLCBhcmdzLCBwcm9ncmFtKVxuICAgIHJldHVybiBlbnYuY29tcGlsZSgpLmJvZHlcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gRFJBVyBQUk9DXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZnVuY3Rpb24gZW1pdERyYXdCb2R5IChlbnYsIGRyYXcsIGFyZ3MsIHByb2dyYW0pIHtcbiAgICBpbmplY3RFeHRlbnNpb25zKGVudiwgZHJhdylcbiAgICBlbWl0QXR0cmlidXRlcyhlbnYsIGRyYXcsIGFyZ3MsIHByb2dyYW0uYXR0cmlidXRlcywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuICAgIGVtaXRVbmlmb3JtcyhlbnYsIGRyYXcsIGFyZ3MsIHByb2dyYW0udW5pZm9ybXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbiAgICBlbWl0RHJhdyhlbnYsIGRyYXcsIGRyYXcsIGFyZ3MpXG4gIH1cblxuICBmdW5jdGlvbiBlbWl0RHJhd1Byb2MgKGVudiwgYXJncykge1xuICAgIHZhciBkcmF3ID0gZW52LnByb2MoJ2RyYXcnLCAxKVxuXG4gICAgaW5qZWN0RXh0ZW5zaW9ucyhlbnYsIGRyYXcpXG5cbiAgICBlbWl0Q29udGV4dChlbnYsIGRyYXcsIGFyZ3MuY29udGV4dClcbiAgICBlbWl0UG9sbEZyYW1lYnVmZmVyKGVudiwgZHJhdywgYXJncy5mcmFtZWJ1ZmZlcilcblxuICAgIGVtaXRQb2xsU3RhdGUoZW52LCBkcmF3LCBhcmdzKVxuICAgIGVtaXRTZXRPcHRpb25zKGVudiwgZHJhdywgYXJncy5zdGF0ZSlcblxuICAgIGVtaXRQcm9maWxlKGVudiwgZHJhdywgYXJncywgZmFsc2UsIHRydWUpXG5cbiAgICB2YXIgcHJvZ3JhbSA9IGFyZ3Muc2hhZGVyLnByb2dWYXIuYXBwZW5kKGVudiwgZHJhdylcbiAgICBkcmF3KGVudi5zaGFyZWQuZ2wsICcudXNlUHJvZ3JhbSgnLCBwcm9ncmFtLCAnLnByb2dyYW0pOycpXG5cbiAgICBpZiAoYXJncy5zaGFkZXIucHJvZ3JhbSkge1xuICAgICAgZW1pdERyYXdCb2R5KGVudiwgZHJhdywgYXJncywgYXJncy5zaGFkZXIucHJvZ3JhbSlcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRyYXdDYWNoZSA9IGVudi5nbG9iYWwuZGVmKCd7fScpXG4gICAgICB2YXIgUFJPR19JRCA9IGRyYXcuZGVmKHByb2dyYW0sICcuaWQnKVxuICAgICAgdmFyIENBQ0hFRF9QUk9DID0gZHJhdy5kZWYoZHJhd0NhY2hlLCAnWycsIFBST0dfSUQsICddJylcbiAgICAgIGRyYXcoXG4gICAgICAgIGVudi5jb25kKENBQ0hFRF9QUk9DKVxuICAgICAgICAgIC50aGVuKENBQ0hFRF9QUk9DLCAnLmNhbGwodGhpcyxhMCk7JylcbiAgICAgICAgICAuZWxzZShcbiAgICAgICAgICAgIENBQ0hFRF9QUk9DLCAnPScsIGRyYXdDYWNoZSwgJ1snLCBQUk9HX0lELCAnXT0nLFxuICAgICAgICAgICAgZW52LmxpbmsoZnVuY3Rpb24gKHByb2dyYW0pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUJvZHkoZW1pdERyYXdCb2R5LCBlbnYsIGFyZ3MsIHByb2dyYW0sIDEpXG4gICAgICAgICAgICB9KSwgJygnLCBwcm9ncmFtLCAnKTsnLFxuICAgICAgICAgICAgQ0FDSEVEX1BST0MsICcuY2FsbCh0aGlzLGEwKTsnKSlcbiAgICB9XG5cbiAgICBpZiAoT2JqZWN0LmtleXMoYXJncy5zdGF0ZSkubGVuZ3RoID4gMCkge1xuICAgICAgZHJhdyhlbnYuc2hhcmVkLmN1cnJlbnQsICcuZGlydHk9dHJ1ZTsnKVxuICAgIH1cbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gQkFUQ0ggUFJPQ1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gZW1pdEJhdGNoRHluYW1pY1NoYWRlckJvZHkgKGVudiwgc2NvcGUsIGFyZ3MsIHByb2dyYW0pIHtcbiAgICBlbnYuYmF0Y2hJZCA9ICdhMSdcblxuICAgIGluamVjdEV4dGVuc2lvbnMoZW52LCBzY29wZSlcblxuICAgIGZ1bmN0aW9uIGFsbCAoKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGVtaXRBdHRyaWJ1dGVzKGVudiwgc2NvcGUsIGFyZ3MsIHByb2dyYW0uYXR0cmlidXRlcywgYWxsKVxuICAgIGVtaXRVbmlmb3JtcyhlbnYsIHNjb3BlLCBhcmdzLCBwcm9ncmFtLnVuaWZvcm1zLCBhbGwpXG4gICAgZW1pdERyYXcoZW52LCBzY29wZSwgc2NvcGUsIGFyZ3MpXG4gIH1cblxuICBmdW5jdGlvbiBlbWl0QmF0Y2hCb2R5IChlbnYsIHNjb3BlLCBhcmdzLCBwcm9ncmFtKSB7XG4gICAgaW5qZWN0RXh0ZW5zaW9ucyhlbnYsIHNjb3BlKVxuXG4gICAgdmFyIGNvbnRleHREeW5hbWljID0gYXJncy5jb250ZXh0RGVwXG5cbiAgICB2YXIgQkFUQ0hfSUQgPSBzY29wZS5kZWYoKVxuICAgIHZhciBQUk9QX0xJU1QgPSAnYTAnXG4gICAgdmFyIE5VTV9QUk9QUyA9ICdhMSdcbiAgICB2YXIgUFJPUFMgPSBzY29wZS5kZWYoKVxuICAgIGVudi5zaGFyZWQucHJvcHMgPSBQUk9QU1xuICAgIGVudi5iYXRjaElkID0gQkFUQ0hfSURcblxuICAgIHZhciBvdXRlciA9IGVudi5zY29wZSgpXG4gICAgdmFyIGlubmVyID0gZW52LnNjb3BlKClcblxuICAgIHNjb3BlKFxuICAgICAgb3V0ZXIuZW50cnksXG4gICAgICAnZm9yKCcsIEJBVENIX0lELCAnPTA7JywgQkFUQ0hfSUQsICc8JywgTlVNX1BST1BTLCAnOysrJywgQkFUQ0hfSUQsICcpeycsXG4gICAgICBQUk9QUywgJz0nLCBQUk9QX0xJU1QsICdbJywgQkFUQ0hfSUQsICddOycsXG4gICAgICBpbm5lcixcbiAgICAgICd9JyxcbiAgICAgIG91dGVyLmV4aXQpXG5cbiAgICBmdW5jdGlvbiBpc0lubmVyRGVmbiAoZGVmbikge1xuICAgICAgcmV0dXJuICgoZGVmbi5jb250ZXh0RGVwICYmIGNvbnRleHREeW5hbWljKSB8fCBkZWZuLnByb3BEZXApXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNPdXRlckRlZm4gKGRlZm4pIHtcbiAgICAgIHJldHVybiAhaXNJbm5lckRlZm4oZGVmbilcbiAgICB9XG5cbiAgICBpZiAoYXJncy5uZWVkc0NvbnRleHQpIHtcbiAgICAgIGVtaXRDb250ZXh0KGVudiwgaW5uZXIsIGFyZ3MuY29udGV4dClcbiAgICB9XG4gICAgaWYgKGFyZ3MubmVlZHNGcmFtZWJ1ZmZlcikge1xuICAgICAgZW1pdFBvbGxGcmFtZWJ1ZmZlcihlbnYsIGlubmVyLCBhcmdzLmZyYW1lYnVmZmVyKVxuICAgIH1cbiAgICBlbWl0U2V0T3B0aW9ucyhlbnYsIGlubmVyLCBhcmdzLnN0YXRlLCBpc0lubmVyRGVmbilcblxuICAgIGlmIChhcmdzLnByb2ZpbGUgJiYgaXNJbm5lckRlZm4oYXJncy5wcm9maWxlKSkge1xuICAgICAgZW1pdFByb2ZpbGUoZW52LCBpbm5lciwgYXJncywgZmFsc2UsIHRydWUpXG4gICAgfVxuXG4gICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICB2YXIgcHJvZ0NhY2hlID0gZW52Lmdsb2JhbC5kZWYoJ3t9JylcbiAgICAgIHZhciBQUk9HUkFNID0gYXJncy5zaGFkZXIucHJvZ1Zhci5hcHBlbmQoZW52LCBpbm5lcilcbiAgICAgIHZhciBQUk9HX0lEID0gaW5uZXIuZGVmKFBST0dSQU0sICcuaWQnKVxuICAgICAgdmFyIENBQ0hFRF9QUk9DID0gaW5uZXIuZGVmKHByb2dDYWNoZSwgJ1snLCBQUk9HX0lELCAnXScpXG4gICAgICBpbm5lcihcbiAgICAgICAgZW52LnNoYXJlZC5nbCwgJy51c2VQcm9ncmFtKCcsIFBST0dSQU0sICcucHJvZ3JhbSk7JyxcbiAgICAgICAgJ2lmKCEnLCBDQUNIRURfUFJPQywgJyl7JyxcbiAgICAgICAgQ0FDSEVEX1BST0MsICc9JywgcHJvZ0NhY2hlLCAnWycsIFBST0dfSUQsICddPScsXG4gICAgICAgIGVudi5saW5rKGZ1bmN0aW9uIChwcm9ncmFtKSB7XG4gICAgICAgICAgcmV0dXJuIGNyZWF0ZUJvZHkoXG4gICAgICAgICAgICBlbWl0QmF0Y2hEeW5hbWljU2hhZGVyQm9keSwgZW52LCBhcmdzLCBwcm9ncmFtLCAyKVxuICAgICAgICB9KSwgJygnLCBQUk9HUkFNLCAnKTt9JyxcbiAgICAgICAgQ0FDSEVEX1BST0MsICcuY2FsbCh0aGlzLGEwWycsIEJBVENIX0lELCAnXSwnLCBCQVRDSF9JRCwgJyk7JylcbiAgICB9IGVsc2Uge1xuICAgICAgZW1pdEF0dHJpYnV0ZXMoZW52LCBvdXRlciwgYXJncywgcHJvZ3JhbS5hdHRyaWJ1dGVzLCBpc091dGVyRGVmbilcbiAgICAgIGVtaXRBdHRyaWJ1dGVzKGVudiwgaW5uZXIsIGFyZ3MsIHByb2dyYW0uYXR0cmlidXRlcywgaXNJbm5lckRlZm4pXG4gICAgICBlbWl0VW5pZm9ybXMoZW52LCBvdXRlciwgYXJncywgcHJvZ3JhbS51bmlmb3JtcywgaXNPdXRlckRlZm4pXG4gICAgICBlbWl0VW5pZm9ybXMoZW52LCBpbm5lciwgYXJncywgcHJvZ3JhbS51bmlmb3JtcywgaXNJbm5lckRlZm4pXG4gICAgICBlbWl0RHJhdyhlbnYsIG91dGVyLCBpbm5lciwgYXJncylcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbWl0QmF0Y2hQcm9jIChlbnYsIGFyZ3MpIHtcbiAgICB2YXIgYmF0Y2ggPSBlbnYucHJvYygnYmF0Y2gnLCAyKVxuICAgIGVudi5iYXRjaElkID0gJzAnXG5cbiAgICBpbmplY3RFeHRlbnNpb25zKGVudiwgYmF0Y2gpXG5cbiAgICAvLyBDaGVjayBpZiBhbnkgY29udGV4dCB2YXJpYWJsZXMgZGVwZW5kIG9uIHByb3BzXG4gICAgdmFyIGNvbnRleHREeW5hbWljID0gZmFsc2VcbiAgICB2YXIgbmVlZHNDb250ZXh0ID0gdHJ1ZVxuICAgIE9iamVjdC5rZXlzKGFyZ3MuY29udGV4dCkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgY29udGV4dER5bmFtaWMgPSBjb250ZXh0RHluYW1pYyB8fCBhcmdzLmNvbnRleHRbbmFtZV0ucHJvcERlcFxuICAgIH0pXG4gICAgaWYgKCFjb250ZXh0RHluYW1pYykge1xuICAgICAgZW1pdENvbnRleHQoZW52LCBiYXRjaCwgYXJncy5jb250ZXh0KVxuICAgICAgbmVlZHNDb250ZXh0ID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBmcmFtZWJ1ZmZlciBzdGF0ZSBhZmZlY3RzIGZyYW1lYnVmZmVyV2lkdGgvaGVpZ2h0IGNvbnRleHQgdmFyc1xuICAgIHZhciBmcmFtZWJ1ZmZlciA9IGFyZ3MuZnJhbWVidWZmZXJcbiAgICB2YXIgbmVlZHNGcmFtZWJ1ZmZlciA9IGZhbHNlXG4gICAgaWYgKGZyYW1lYnVmZmVyKSB7XG4gICAgICBpZiAoZnJhbWVidWZmZXIucHJvcERlcCkge1xuICAgICAgICBjb250ZXh0RHluYW1pYyA9IG5lZWRzRnJhbWVidWZmZXIgPSB0cnVlXG4gICAgICB9IGVsc2UgaWYgKGZyYW1lYnVmZmVyLmNvbnRleHREZXAgJiYgY29udGV4dER5bmFtaWMpIHtcbiAgICAgICAgbmVlZHNGcmFtZWJ1ZmZlciA9IHRydWVcbiAgICAgIH1cbiAgICAgIGlmICghbmVlZHNGcmFtZWJ1ZmZlcikge1xuICAgICAgICBlbWl0UG9sbEZyYW1lYnVmZmVyKGVudiwgYmF0Y2gsIGZyYW1lYnVmZmVyKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0UG9sbEZyYW1lYnVmZmVyKGVudiwgYmF0Y2gsIG51bGwpXG4gICAgfVxuXG4gICAgLy8gdmlld3BvcnQgaXMgd2VpcmQgYmVjYXVzZSBpdCBjYW4gYWZmZWN0IGNvbnRleHQgdmFyc1xuICAgIGlmIChhcmdzLnN0YXRlLnZpZXdwb3J0ICYmIGFyZ3Muc3RhdGUudmlld3BvcnQucHJvcERlcCkge1xuICAgICAgY29udGV4dER5bmFtaWMgPSB0cnVlXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNJbm5lckRlZm4gKGRlZm4pIHtcbiAgICAgIHJldHVybiAoZGVmbi5jb250ZXh0RGVwICYmIGNvbnRleHREeW5hbWljKSB8fCBkZWZuLnByb3BEZXBcbiAgICB9XG5cbiAgICAvLyBzZXQgd2ViZ2wgb3B0aW9uc1xuICAgIGVtaXRQb2xsU3RhdGUoZW52LCBiYXRjaCwgYXJncylcbiAgICBlbWl0U2V0T3B0aW9ucyhlbnYsIGJhdGNoLCBhcmdzLnN0YXRlLCBmdW5jdGlvbiAoZGVmbikge1xuICAgICAgcmV0dXJuICFpc0lubmVyRGVmbihkZWZuKVxuICAgIH0pXG5cbiAgICBpZiAoIWFyZ3MucHJvZmlsZSB8fCAhaXNJbm5lckRlZm4oYXJncy5wcm9maWxlKSkge1xuICAgICAgZW1pdFByb2ZpbGUoZW52LCBiYXRjaCwgYXJncywgZmFsc2UsICdhMScpXG4gICAgfVxuXG4gICAgLy8gU2F2ZSB0aGVzZSB2YWx1ZXMgdG8gYXJncyBzbyB0aGF0IHRoZSBiYXRjaCBib2R5IHJvdXRpbmUgY2FuIHVzZSB0aGVtXG4gICAgYXJncy5jb250ZXh0RGVwID0gY29udGV4dER5bmFtaWNcbiAgICBhcmdzLm5lZWRzQ29udGV4dCA9IG5lZWRzQ29udGV4dFxuICAgIGFyZ3MubmVlZHNGcmFtZWJ1ZmZlciA9IG5lZWRzRnJhbWVidWZmZXJcblxuICAgIC8vIGRldGVybWluZSBpZiBzaGFkZXIgaXMgZHluYW1pY1xuICAgIHZhciBwcm9nRGVmbiA9IGFyZ3Muc2hhZGVyLnByb2dWYXJcbiAgICBpZiAoKHByb2dEZWZuLmNvbnRleHREZXAgJiYgY29udGV4dER5bmFtaWMpIHx8IHByb2dEZWZuLnByb3BEZXApIHtcbiAgICAgIGVtaXRCYXRjaEJvZHkoXG4gICAgICAgIGVudixcbiAgICAgICAgYmF0Y2gsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIG51bGwpXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBQUk9HUkFNID0gcHJvZ0RlZm4uYXBwZW5kKGVudiwgYmF0Y2gpXG4gICAgICBiYXRjaChlbnYuc2hhcmVkLmdsLCAnLnVzZVByb2dyYW0oJywgUFJPR1JBTSwgJy5wcm9ncmFtKTsnKVxuICAgICAgaWYgKGFyZ3Muc2hhZGVyLnByb2dyYW0pIHtcbiAgICAgICAgZW1pdEJhdGNoQm9keShcbiAgICAgICAgICBlbnYsXG4gICAgICAgICAgYmF0Y2gsXG4gICAgICAgICAgYXJncyxcbiAgICAgICAgICBhcmdzLnNoYWRlci5wcm9ncmFtKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGJhdGNoQ2FjaGUgPSBlbnYuZ2xvYmFsLmRlZigne30nKVxuICAgICAgICB2YXIgUFJPR19JRCA9IGJhdGNoLmRlZihQUk9HUkFNLCAnLmlkJylcbiAgICAgICAgdmFyIENBQ0hFRF9QUk9DID0gYmF0Y2guZGVmKGJhdGNoQ2FjaGUsICdbJywgUFJPR19JRCwgJ10nKVxuICAgICAgICBiYXRjaChcbiAgICAgICAgICBlbnYuY29uZChDQUNIRURfUFJPQylcbiAgICAgICAgICAgIC50aGVuKENBQ0hFRF9QUk9DLCAnLmNhbGwodGhpcyxhMCxhMSk7JylcbiAgICAgICAgICAgIC5lbHNlKFxuICAgICAgICAgICAgICBDQUNIRURfUFJPQywgJz0nLCBiYXRjaENhY2hlLCAnWycsIFBST0dfSUQsICddPScsXG4gICAgICAgICAgICAgIGVudi5saW5rKGZ1bmN0aW9uIChwcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUJvZHkoZW1pdEJhdGNoQm9keSwgZW52LCBhcmdzLCBwcm9ncmFtLCAyKVxuICAgICAgICAgICAgICB9KSwgJygnLCBQUk9HUkFNLCAnKTsnLFxuICAgICAgICAgICAgICBDQUNIRURfUFJPQywgJy5jYWxsKHRoaXMsYTAsYTEpOycpKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChPYmplY3Qua2V5cyhhcmdzLnN0YXRlKS5sZW5ndGggPiAwKSB7XG4gICAgICBiYXRjaChlbnYuc2hhcmVkLmN1cnJlbnQsICcuZGlydHk9dHJ1ZTsnKVxuICAgIH1cbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gU0NPUEUgQ09NTUFORFxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGZ1bmN0aW9uIGVtaXRTY29wZVByb2MgKGVudiwgYXJncykge1xuICAgIHZhciBzY29wZSA9IGVudi5wcm9jKCdzY29wZScsIDMpXG4gICAgZW52LmJhdGNoSWQgPSAnYTInXG5cbiAgICB2YXIgc2hhcmVkID0gZW52LnNoYXJlZFxuICAgIHZhciBDVVJSRU5UX1NUQVRFID0gc2hhcmVkLmN1cnJlbnRcblxuICAgIGVtaXRDb250ZXh0KGVudiwgc2NvcGUsIGFyZ3MuY29udGV4dClcblxuICAgIGlmIChhcmdzLmZyYW1lYnVmZmVyKSB7XG4gICAgICBhcmdzLmZyYW1lYnVmZmVyLmFwcGVuZChlbnYsIHNjb3BlKVxuICAgIH1cblxuICAgIHNvcnRTdGF0ZShPYmplY3Qua2V5cyhhcmdzLnN0YXRlKSkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgdmFyIGRlZm4gPSBhcmdzLnN0YXRlW25hbWVdXG4gICAgICB2YXIgdmFsdWUgPSBkZWZuLmFwcGVuZChlbnYsIHNjb3BlKVxuICAgICAgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSkge1xuICAgICAgICB2YWx1ZS5mb3JFYWNoKGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgICAgc2NvcGUuc2V0KGVudi5uZXh0W25hbWVdLCAnWycgKyBpICsgJ10nLCB2KVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NvcGUuc2V0KHNoYXJlZC5uZXh0LCAnLicgKyBuYW1lLCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgZW1pdFByb2ZpbGUoZW52LCBzY29wZSwgYXJncywgdHJ1ZSwgdHJ1ZSlcblxuICAgIDtbU19FTEVNRU5UUywgU19PRkZTRVQsIFNfQ09VTlQsIFNfSU5TVEFOQ0VTLCBTX1BSSU1JVElWRV0uZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uIChvcHQpIHtcbiAgICAgICAgdmFyIHZhcmlhYmxlID0gYXJncy5kcmF3W29wdF1cbiAgICAgICAgaWYgKCF2YXJpYWJsZSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHNjb3BlLnNldChzaGFyZWQuZHJhdywgJy4nICsgb3B0LCAnJyArIHZhcmlhYmxlLmFwcGVuZChlbnYsIHNjb3BlKSlcbiAgICAgIH0pXG5cbiAgICBPYmplY3Qua2V5cyhhcmdzLnVuaWZvcm1zKS5mb3JFYWNoKGZ1bmN0aW9uIChvcHQpIHtcbiAgICAgIHNjb3BlLnNldChcbiAgICAgICAgc2hhcmVkLnVuaWZvcm1zLFxuICAgICAgICAnWycgKyBzdHJpbmdTdG9yZS5pZChvcHQpICsgJ10nLFxuICAgICAgICBhcmdzLnVuaWZvcm1zW29wdF0uYXBwZW5kKGVudiwgc2NvcGUpKVxuICAgIH0pXG5cbiAgICBPYmplY3Qua2V5cyhhcmdzLmF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciByZWNvcmQgPSBhcmdzLmF0dHJpYnV0ZXNbbmFtZV0uYXBwZW5kKGVudiwgc2NvcGUpXG4gICAgICB2YXIgc2NvcGVBdHRyaWIgPSBlbnYuc2NvcGVBdHRyaWIobmFtZSlcbiAgICAgIE9iamVjdC5rZXlzKG5ldyBBdHRyaWJ1dGVSZWNvcmQoKSkuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICAgICAgICBzY29wZS5zZXQoc2NvcGVBdHRyaWIsICcuJyArIHByb3AsIHJlY29yZFtwcm9wXSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGZ1bmN0aW9uIHNhdmVTaGFkZXIgKG5hbWUpIHtcbiAgICAgIHZhciBzaGFkZXIgPSBhcmdzLnNoYWRlcltuYW1lXVxuICAgICAgaWYgKHNoYWRlcikge1xuICAgICAgICBzY29wZS5zZXQoc2hhcmVkLnNoYWRlciwgJy4nICsgbmFtZSwgc2hhZGVyLmFwcGVuZChlbnYsIHNjb3BlKSlcbiAgICAgIH1cbiAgICB9XG4gICAgc2F2ZVNoYWRlcihTX1ZFUlQpXG4gICAgc2F2ZVNoYWRlcihTX0ZSQUcpXG5cbiAgICBpZiAoT2JqZWN0LmtleXMoYXJncy5zdGF0ZSkubGVuZ3RoID4gMCkge1xuICAgICAgc2NvcGUoQ1VSUkVOVF9TVEFURSwgJy5kaXJ0eT10cnVlOycpXG4gICAgICBzY29wZS5leGl0KENVUlJFTlRfU1RBVEUsICcuZGlydHk9dHJ1ZTsnKVxuICAgIH1cblxuICAgIHNjb3BlKCdhMSgnLCBlbnYuc2hhcmVkLmNvbnRleHQsICcsYTAsJywgZW52LmJhdGNoSWQsICcpOycpXG4gIH1cblxuICBmdW5jdGlvbiBpc0R5bmFtaWNPYmplY3QgKG9iamVjdCkge1xuICAgIGlmICh0eXBlb2Ygb2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBpc0FycmF5TGlrZShvYmplY3QpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIHByb3BzID0gT2JqZWN0LmtleXMob2JqZWN0KVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChkeW5hbWljLmlzRHluYW1pYyhvYmplY3RbcHJvcHNbaV1dKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHNwbGF0T2JqZWN0IChlbnYsIG9wdGlvbnMsIG5hbWUpIHtcbiAgICB2YXIgb2JqZWN0ID0gb3B0aW9ucy5zdGF0aWNbbmFtZV1cbiAgICBpZiAoIW9iamVjdCB8fCAhaXNEeW5hbWljT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBnbG9iYWxzID0gZW52Lmdsb2JhbFxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KVxuICAgIHZhciB0aGlzRGVwID0gZmFsc2VcbiAgICB2YXIgY29udGV4dERlcCA9IGZhbHNlXG4gICAgdmFyIHByb3BEZXAgPSBmYWxzZVxuICAgIHZhciBvYmplY3RSZWYgPSBlbnYuZ2xvYmFsLmRlZigne30nKVxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgdmFsdWUgPSBvYmplY3Rba2V5XVxuICAgICAgaWYgKGR5bmFtaWMuaXNEeW5hbWljKHZhbHVlKSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdmFsdWUgPSBvYmplY3Rba2V5XSA9IGR5bmFtaWMudW5ib3godmFsdWUpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRlcHMgPSBjcmVhdGVEeW5hbWljRGVjbCh2YWx1ZSwgbnVsbClcbiAgICAgICAgdGhpc0RlcCA9IHRoaXNEZXAgfHwgZGVwcy50aGlzRGVwXG4gICAgICAgIHByb3BEZXAgPSBwcm9wRGVwIHx8IGRlcHMucHJvcERlcFxuICAgICAgICBjb250ZXh0RGVwID0gY29udGV4dERlcCB8fCBkZXBzLmNvbnRleHREZXBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdsb2JhbHMob2JqZWN0UmVmLCAnLicsIGtleSwgJz0nKVxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgICAgICBnbG9iYWxzKHZhbHVlKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgZ2xvYmFscygnXCInLCB2YWx1ZSwgJ1wiJylcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICBnbG9iYWxzKCdbJywgdmFsdWUuam9pbigpLCAnXScpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBnbG9iYWxzKGVudi5saW5rKHZhbHVlKSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgZ2xvYmFscygnOycpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGZ1bmN0aW9uIGFwcGVuZEJsb2NrIChlbnYsIGJsb2NrKSB7XG4gICAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBvYmplY3Rba2V5XVxuICAgICAgICBpZiAoIWR5bmFtaWMuaXNEeW5hbWljKHZhbHVlKSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHZhciByZWYgPSBlbnYuaW52b2tlKGJsb2NrLCB2YWx1ZSlcbiAgICAgICAgYmxvY2sob2JqZWN0UmVmLCAnLicsIGtleSwgJz0nLCByZWYsICc7JylcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgb3B0aW9ucy5keW5hbWljW25hbWVdID0gbmV3IGR5bmFtaWMuRHluYW1pY1ZhcmlhYmxlKERZTl9USFVOSywge1xuICAgICAgdGhpc0RlcDogdGhpc0RlcCxcbiAgICAgIGNvbnRleHREZXA6IGNvbnRleHREZXAsXG4gICAgICBwcm9wRGVwOiBwcm9wRGVwLFxuICAgICAgcmVmOiBvYmplY3RSZWYsXG4gICAgICBhcHBlbmQ6IGFwcGVuZEJsb2NrXG4gICAgfSlcbiAgICBkZWxldGUgb3B0aW9ucy5zdGF0aWNbbmFtZV1cbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gTUFJTiBEUkFXIENPTU1BTkRcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBmdW5jdGlvbiBjb21waWxlQ29tbWFuZCAob3B0aW9ucywgYXR0cmlidXRlcywgdW5pZm9ybXMsIGNvbnRleHQsIHN0YXRzKSB7XG4gICAgdmFyIGVudiA9IGNyZWF0ZVJFR0xFbnZpcm9ubWVudCgpXG5cbiAgICAvLyBsaW5rIHN0YXRzLCBzbyB0aGF0IHdlIGNhbiBlYXNpbHkgYWNjZXNzIGl0IGluIHRoZSBwcm9ncmFtLlxuICAgIGVudi5zdGF0cyA9IGVudi5saW5rKHN0YXRzKVxuXG4gICAgLy8gc3BsYXQgb3B0aW9ucyBhbmQgYXR0cmlidXRlcyB0byBhbGxvdyBmb3IgZHluYW1pYyBuZXN0ZWQgcHJvcGVydGllc1xuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMuc3RhdGljKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHNwbGF0T2JqZWN0KGVudiwgYXR0cmlidXRlcywga2V5KVxuICAgIH0pXG4gICAgTkVTVEVEX09QVElPTlMuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgc3BsYXRPYmplY3QoZW52LCBvcHRpb25zLCBuYW1lKVxuICAgIH0pXG5cbiAgICB2YXIgYXJncyA9IHBhcnNlQXJndW1lbnRzKG9wdGlvbnMsIGF0dHJpYnV0ZXMsIHVuaWZvcm1zLCBjb250ZXh0LCBlbnYpXG5cbiAgICBlbWl0RHJhd1Byb2MoZW52LCBhcmdzKVxuICAgIGVtaXRTY29wZVByb2MoZW52LCBhcmdzKVxuICAgIGVtaXRCYXRjaFByb2MoZW52LCBhcmdzKVxuXG4gICAgcmV0dXJuIGVudi5jb21waWxlKClcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gUE9MTCAvIFJFRlJFU0hcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICByZXR1cm4ge1xuICAgIG5leHQ6IG5leHRTdGF0ZSxcbiAgICBjdXJyZW50OiBjdXJyZW50U3RhdGUsXG4gICAgcHJvY3M6IChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZW52ID0gY3JlYXRlUkVHTEVudmlyb25tZW50KClcbiAgICAgIHZhciBwb2xsID0gZW52LnByb2MoJ3BvbGwnKVxuICAgICAgdmFyIHJlZnJlc2ggPSBlbnYucHJvYygncmVmcmVzaCcpXG4gICAgICB2YXIgY29tbW9uID0gZW52LmJsb2NrKClcbiAgICAgIHBvbGwoY29tbW9uKVxuICAgICAgcmVmcmVzaChjb21tb24pXG5cbiAgICAgIHZhciBzaGFyZWQgPSBlbnYuc2hhcmVkXG4gICAgICB2YXIgR0wgPSBzaGFyZWQuZ2xcbiAgICAgIHZhciBORVhUX1NUQVRFID0gc2hhcmVkLm5leHRcbiAgICAgIHZhciBDVVJSRU5UX1NUQVRFID0gc2hhcmVkLmN1cnJlbnRcblxuICAgICAgY29tbW9uKENVUlJFTlRfU1RBVEUsICcuZGlydHk9ZmFsc2U7JylcblxuICAgICAgZW1pdFBvbGxGcmFtZWJ1ZmZlcihlbnYsIHBvbGwpXG4gICAgICBlbWl0UG9sbEZyYW1lYnVmZmVyKGVudiwgcmVmcmVzaCwgbnVsbCwgdHJ1ZSlcblxuICAgICAgLy8gUmVmcmVzaCB1cGRhdGVzIGFsbCBhdHRyaWJ1dGUgc3RhdGUgY2hhbmdlc1xuICAgICAgdmFyIGV4dEluc3RhbmNpbmcgPSBnbC5nZXRFeHRlbnNpb24oJ2FuZ2xlX2luc3RhbmNlZF9hcnJheXMnKVxuICAgICAgdmFyIElOU1RBTkNJTkdcbiAgICAgIGlmIChleHRJbnN0YW5jaW5nKSB7XG4gICAgICAgIElOU1RBTkNJTkcgPSBlbnYubGluayhleHRJbnN0YW5jaW5nKVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW1pdHMubWF4QXR0cmlidXRlczsgKytpKSB7XG4gICAgICAgIHZhciBCSU5ESU5HID0gcmVmcmVzaC5kZWYoc2hhcmVkLmF0dHJpYnV0ZXMsICdbJywgaSwgJ10nKVxuICAgICAgICB2YXIgaWZ0ZSA9IGVudi5jb25kKEJJTkRJTkcsICcuYnVmZmVyJylcbiAgICAgICAgaWZ0ZS50aGVuKFxuICAgICAgICAgIEdMLCAnLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KCcsIGksICcpOycsXG4gICAgICAgICAgR0wsICcuYmluZEJ1ZmZlcignLFxuICAgICAgICAgICAgR0xfQVJSQVlfQlVGRkVSLCAnLCcsXG4gICAgICAgICAgICBCSU5ESU5HLCAnLmJ1ZmZlci5idWZmZXIpOycsXG4gICAgICAgICAgR0wsICcudmVydGV4QXR0cmliUG9pbnRlcignLFxuICAgICAgICAgICAgaSwgJywnLFxuICAgICAgICAgICAgQklORElORywgJy5zaXplLCcsXG4gICAgICAgICAgICBCSU5ESU5HLCAnLnR5cGUsJyxcbiAgICAgICAgICAgIEJJTkRJTkcsICcubm9ybWFsaXplZCwnLFxuICAgICAgICAgICAgQklORElORywgJy5zdHJpZGUsJyxcbiAgICAgICAgICAgIEJJTkRJTkcsICcub2Zmc2V0KTsnXG4gICAgICAgICkuZWxzZShcbiAgICAgICAgICBHTCwgJy5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkoJywgaSwgJyk7JyxcbiAgICAgICAgICBHTCwgJy52ZXJ0ZXhBdHRyaWI0ZignLFxuICAgICAgICAgICAgaSwgJywnLFxuICAgICAgICAgICAgQklORElORywgJy54LCcsXG4gICAgICAgICAgICBCSU5ESU5HLCAnLnksJyxcbiAgICAgICAgICAgIEJJTkRJTkcsICcueiwnLFxuICAgICAgICAgICAgQklORElORywgJy53KTsnLFxuICAgICAgICAgIEJJTkRJTkcsICcuYnVmZmVyPW51bGw7JylcbiAgICAgICAgcmVmcmVzaChpZnRlKVxuICAgICAgICBpZiAoZXh0SW5zdGFuY2luZykge1xuICAgICAgICAgIHJlZnJlc2goXG4gICAgICAgICAgICBJTlNUQU5DSU5HLCAnLnZlcnRleEF0dHJpYkRpdmlzb3JBTkdMRSgnLFxuICAgICAgICAgICAgaSwgJywnLFxuICAgICAgICAgICAgQklORElORywgJy5kaXZpc29yKTsnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKEdMX0ZMQUdTKS5mb3JFYWNoKGZ1bmN0aW9uIChmbGFnKSB7XG4gICAgICAgIHZhciBjYXAgPSBHTF9GTEFHU1tmbGFnXVxuICAgICAgICB2YXIgTkVYVCA9IGNvbW1vbi5kZWYoTkVYVF9TVEFURSwgJy4nLCBmbGFnKVxuICAgICAgICB2YXIgYmxvY2sgPSBlbnYuYmxvY2soKVxuICAgICAgICBibG9jaygnaWYoJywgTkVYVCwgJyl7JyxcbiAgICAgICAgICBHTCwgJy5lbmFibGUoJywgY2FwLCAnKX1lbHNleycsXG4gICAgICAgICAgR0wsICcuZGlzYWJsZSgnLCBjYXAsICcpfScsXG4gICAgICAgICAgQ1VSUkVOVF9TVEFURSwgJy4nLCBmbGFnLCAnPScsIE5FWFQsICc7JylcbiAgICAgICAgcmVmcmVzaChibG9jaylcbiAgICAgICAgcG9sbChcbiAgICAgICAgICAnaWYoJywgTkVYVCwgJyE9PScsIENVUlJFTlRfU1RBVEUsICcuJywgZmxhZywgJyl7JyxcbiAgICAgICAgICBibG9jayxcbiAgICAgICAgICAnfScpXG4gICAgICB9KVxuXG4gICAgICBPYmplY3Qua2V5cyhHTF9WQVJJQUJMRVMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIGZ1bmMgPSBHTF9WQVJJQUJMRVNbbmFtZV1cbiAgICAgICAgdmFyIGluaXQgPSBjdXJyZW50U3RhdGVbbmFtZV1cbiAgICAgICAgdmFyIE5FWFQsIENVUlJFTlRcbiAgICAgICAgdmFyIGJsb2NrID0gZW52LmJsb2NrKClcbiAgICAgICAgYmxvY2soR0wsICcuJywgZnVuYywgJygnKVxuICAgICAgICBpZiAoaXNBcnJheUxpa2UoaW5pdCkpIHtcbiAgICAgICAgICB2YXIgbiA9IGluaXQubGVuZ3RoXG4gICAgICAgICAgTkVYVCA9IGVudi5nbG9iYWwuZGVmKE5FWFRfU1RBVEUsICcuJywgbmFtZSlcbiAgICAgICAgICBDVVJSRU5UID0gZW52Lmdsb2JhbC5kZWYoQ1VSUkVOVF9TVEFURSwgJy4nLCBuYW1lKVxuICAgICAgICAgIGJsb2NrKFxuICAgICAgICAgICAgbG9vcChuLCBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICByZXR1cm4gTkVYVCArICdbJyArIGkgKyAnXSdcbiAgICAgICAgICAgIH0pLCAnKTsnLFxuICAgICAgICAgICAgbG9vcChuLCBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICByZXR1cm4gQ1VSUkVOVCArICdbJyArIGkgKyAnXT0nICsgTkVYVCArICdbJyArIGkgKyAnXTsnXG4gICAgICAgICAgICB9KS5qb2luKCcnKSlcbiAgICAgICAgICBwb2xsKFxuICAgICAgICAgICAgJ2lmKCcsIGxvb3AobiwgZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIE5FWFQgKyAnWycgKyBpICsgJ10hPT0nICsgQ1VSUkVOVCArICdbJyArIGkgKyAnXSdcbiAgICAgICAgICAgIH0pLmpvaW4oJ3x8JyksICcpeycsXG4gICAgICAgICAgICBibG9jayxcbiAgICAgICAgICAgICd9JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBORVhUID0gY29tbW9uLmRlZihORVhUX1NUQVRFLCAnLicsIG5hbWUpXG4gICAgICAgICAgQ1VSUkVOVCA9IGNvbW1vbi5kZWYoQ1VSUkVOVF9TVEFURSwgJy4nLCBuYW1lKVxuICAgICAgICAgIGJsb2NrKFxuICAgICAgICAgICAgTkVYVCwgJyk7JyxcbiAgICAgICAgICAgIENVUlJFTlRfU1RBVEUsICcuJywgbmFtZSwgJz0nLCBORVhULCAnOycpXG4gICAgICAgICAgcG9sbChcbiAgICAgICAgICAgICdpZignLCBORVhULCAnIT09JywgQ1VSUkVOVCwgJyl7JyxcbiAgICAgICAgICAgIGJsb2NrLFxuICAgICAgICAgICAgJ30nKVxuICAgICAgICB9XG4gICAgICAgIHJlZnJlc2goYmxvY2spXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gZW52LmNvbXBpbGUoKVxuICAgIH0pKCksXG4gICAgY29tcGlsZTogY29tcGlsZUNvbW1hbmRcbiAgfVxufVxuIiwidmFyIFZBUklBQkxFX0NPVU5URVIgPSAwXG5cbnZhciBEWU5fRlVOQyA9IDBcblxuZnVuY3Rpb24gRHluYW1pY1ZhcmlhYmxlICh0eXBlLCBkYXRhKSB7XG4gIHRoaXMuaWQgPSAoVkFSSUFCTEVfQ09VTlRFUisrKVxuICB0aGlzLnR5cGUgPSB0eXBlXG4gIHRoaXMuZGF0YSA9IGRhdGFcbn1cblxuZnVuY3Rpb24gZXNjYXBlU3RyIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxufVxuXG5mdW5jdGlvbiBzcGxpdFBhcnRzIChzdHIpIHtcbiAgaWYgKHN0ci5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIHZhciBmaXJzdENoYXIgPSBzdHIuY2hhckF0KDApXG4gIHZhciBsYXN0Q2hhciA9IHN0ci5jaGFyQXQoc3RyLmxlbmd0aCAtIDEpXG5cbiAgaWYgKHN0ci5sZW5ndGggPiAxICYmXG4gICAgICBmaXJzdENoYXIgPT09IGxhc3RDaGFyICYmXG4gICAgICAoZmlyc3RDaGFyID09PSAnXCInIHx8IGZpcnN0Q2hhciA9PT0gXCInXCIpKSB7XG4gICAgcmV0dXJuIFsnXCInICsgZXNjYXBlU3RyKHN0ci5zdWJzdHIoMSwgc3RyLmxlbmd0aCAtIDIpKSArICdcIiddXG4gIH1cblxuICB2YXIgcGFydHMgPSAvXFxbKGZhbHNlfHRydWV8bnVsbHxcXGQrfCdbXiddKid8XCJbXlwiXSpcIilcXF0vLmV4ZWMoc3RyKVxuICBpZiAocGFydHMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3BsaXRQYXJ0cyhzdHIuc3Vic3RyKDAsIHBhcnRzLmluZGV4KSlcbiAgICAgIC5jb25jYXQoc3BsaXRQYXJ0cyhwYXJ0c1sxXSkpXG4gICAgICAuY29uY2F0KHNwbGl0UGFydHMoc3RyLnN1YnN0cihwYXJ0cy5pbmRleCArIHBhcnRzWzBdLmxlbmd0aCkpKVxuICAgIClcbiAgfVxuXG4gIHZhciBzdWJwYXJ0cyA9IHN0ci5zcGxpdCgnLicpXG4gIGlmIChzdWJwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gWydcIicgKyBlc2NhcGVTdHIoc3RyKSArICdcIiddXG4gIH1cblxuICB2YXIgcmVzdWx0ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJwYXJ0cy5sZW5ndGg7ICsraSkge1xuICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoc3BsaXRQYXJ0cyhzdWJwYXJ0c1tpXSkpXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiB0b0FjY2Vzc29yU3RyaW5nIChzdHIpIHtcbiAgcmV0dXJuICdbJyArIHNwbGl0UGFydHMoc3RyKS5qb2luKCddWycpICsgJ10nXG59XG5cbmZ1bmN0aW9uIGRlZmluZUR5bmFtaWMgKHR5cGUsIGRhdGEpIHtcbiAgcmV0dXJuIG5ldyBEeW5hbWljVmFyaWFibGUodHlwZSwgdG9BY2Nlc3NvclN0cmluZyhkYXRhICsgJycpKVxufVxuXG5mdW5jdGlvbiBpc0R5bmFtaWMgKHgpIHtcbiAgcmV0dXJuICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyAmJiAheC5fcmVnbFR5cGUpIHx8XG4gICAgICAgICB4IGluc3RhbmNlb2YgRHluYW1pY1ZhcmlhYmxlXG59XG5cbmZ1bmN0aW9uIHVuYm94ICh4LCBwYXRoKSB7XG4gIGlmICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBuZXcgRHluYW1pY1ZhcmlhYmxlKERZTl9GVU5DLCB4KVxuICB9XG4gIHJldHVybiB4XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBEeW5hbWljVmFyaWFibGU6IER5bmFtaWNWYXJpYWJsZSxcbiAgZGVmaW5lOiBkZWZpbmVEeW5hbWljLFxuICBpc0R5bmFtaWM6IGlzRHluYW1pYyxcbiAgdW5ib3g6IHVuYm94LFxuICBhY2Nlc3NvcjogdG9BY2Nlc3NvclN0cmluZ1xufVxuIiwiXG52YXIgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi91dGlsL2lzLXR5cGVkLWFycmF5JylcbnZhciBpc05EQXJyYXlMaWtlID0gcmVxdWlyZSgnLi91dGlsL2lzLW5kYXJyYXknKVxudmFyIHZhbHVlcyA9IHJlcXVpcmUoJy4vdXRpbC92YWx1ZXMnKVxuXG52YXIgcHJpbVR5cGVzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvcHJpbWl0aXZlcy5qc29uJylcbnZhciB1c2FnZVR5cGVzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvdXNhZ2UuanNvbicpXG5cbnZhciBHTF9QT0lOVFMgPSAwXG52YXIgR0xfTElORVMgPSAxXG52YXIgR0xfVFJJQU5HTEVTID0gNFxuXG52YXIgR0xfQllURSA9IDUxMjBcbnZhciBHTF9VTlNJR05FRF9CWVRFID0gNTEyMVxudmFyIEdMX1NIT1JUID0gNTEyMlxudmFyIEdMX1VOU0lHTkVEX1NIT1JUID0gNTEyM1xudmFyIEdMX0lOVCA9IDUxMjRcbnZhciBHTF9VTlNJR05FRF9JTlQgPSA1MTI1XG5cbnZhciBHTF9FTEVNRU5UX0FSUkFZX0JVRkZFUiA9IDM0OTYzXG5cbnZhciBHTF9TVFJFQU1fRFJBVyA9IDB4ODhFMFxudmFyIEdMX1NUQVRJQ19EUkFXID0gMHg4OEU0XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gd3JhcEVsZW1lbnRzU3RhdGUgKGdsLCBleHRlbnNpb25zLCBidWZmZXJTdGF0ZSwgc3RhdHMpIHtcbiAgdmFyIGVsZW1lbnRTZXQgPSB7fVxuICB2YXIgZWxlbWVudENvdW50ID0gMFxuXG4gIHZhciBlbGVtZW50VHlwZXMgPSB7XG4gICAgJ3VpbnQ4JzogR0xfVU5TSUdORURfQllURSxcbiAgICAndWludDE2JzogR0xfVU5TSUdORURfU0hPUlRcbiAgfVxuXG4gIGlmIChleHRlbnNpb25zLm9lc19lbGVtZW50X2luZGV4X3VpbnQpIHtcbiAgICBlbGVtZW50VHlwZXMudWludDMyID0gR0xfVU5TSUdORURfSU5UXG4gIH1cblxuICBmdW5jdGlvbiBSRUdMRWxlbWVudEJ1ZmZlciAoYnVmZmVyKSB7XG4gICAgdGhpcy5pZCA9IGVsZW1lbnRDb3VudCsrXG4gICAgZWxlbWVudFNldFt0aGlzLmlkXSA9IHRoaXNcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlclxuICAgIHRoaXMucHJpbVR5cGUgPSBHTF9UUklBTkdMRVNcbiAgICB0aGlzLnZlcnRDb3VudCA9IDBcbiAgICB0aGlzLnR5cGUgPSAwXG4gIH1cblxuICBSRUdMRWxlbWVudEJ1ZmZlci5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmJ1ZmZlci5iaW5kKClcbiAgfVxuXG4gIHZhciBidWZmZXJQb29sID0gW11cblxuICBmdW5jdGlvbiBjcmVhdGVFbGVtZW50U3RyZWFtIChkYXRhKSB7XG4gICAgdmFyIHJlc3VsdCA9IGJ1ZmZlclBvb2wucG9wKClcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmVzdWx0ID0gbmV3IFJFR0xFbGVtZW50QnVmZmVyKGJ1ZmZlclN0YXRlLmNyZWF0ZShcbiAgICAgICAgbnVsbCxcbiAgICAgICAgR0xfRUxFTUVOVF9BUlJBWV9CVUZGRVIsXG4gICAgICAgIHRydWUsXG4gICAgICAgIGZhbHNlKS5fYnVmZmVyKVxuICAgIH1cbiAgICBpbml0RWxlbWVudHMocmVzdWx0LCBkYXRhLCBHTF9TVFJFQU1fRFJBVywgLTEsIC0xLCAwLCAwKVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlc3Ryb3lFbGVtZW50U3RyZWFtIChlbGVtZW50cykge1xuICAgIGJ1ZmZlclBvb2wucHVzaChlbGVtZW50cylcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRFbGVtZW50cyAoXG4gICAgZWxlbWVudHMsXG4gICAgZGF0YSxcbiAgICB1c2FnZSxcbiAgICBwcmltLFxuICAgIGNvdW50LFxuICAgIGJ5dGVMZW5ndGgsXG4gICAgdHlwZSkge1xuICAgIHZhciBwcmVkaWN0ZWRUeXBlID0gdHlwZVxuICAgIGlmICghdHlwZSAmJiAoXG4gICAgICAgICFpc1R5cGVkQXJyYXkoZGF0YSkgfHxcbiAgICAgICAoaXNOREFycmF5TGlrZShkYXRhKSAmJiAhaXNUeXBlZEFycmF5KGRhdGEuZGF0YSkpKSkge1xuICAgICAgcHJlZGljdGVkVHlwZSA9IGV4dGVuc2lvbnMub2VzX2VsZW1lbnRfaW5kZXhfdWludFxuICAgICAgICA/IEdMX1VOU0lHTkVEX0lOVFxuICAgICAgICA6IEdMX1VOU0lHTkVEX1NIT1JUXG4gICAgfVxuICAgIGVsZW1lbnRzLmJ1ZmZlci5iaW5kKClcbiAgICBidWZmZXJTdGF0ZS5faW5pdEJ1ZmZlcihcbiAgICAgIGVsZW1lbnRzLmJ1ZmZlcixcbiAgICAgIGRhdGEsXG4gICAgICB1c2FnZSxcbiAgICAgIHByZWRpY3RlZFR5cGUsXG4gICAgICAzKVxuXG4gICAgdmFyIGR0eXBlID0gdHlwZVxuICAgIGlmICghdHlwZSkge1xuICAgICAgc3dpdGNoIChlbGVtZW50cy5idWZmZXIuZHR5cGUpIHtcbiAgICAgICAgY2FzZSBHTF9VTlNJR05FRF9CWVRFOlxuICAgICAgICBjYXNlIEdMX0JZVEU6XG4gICAgICAgICAgZHR5cGUgPSBHTF9VTlNJR05FRF9CWVRFXG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlIEdMX1VOU0lHTkVEX1NIT1JUOlxuICAgICAgICBjYXNlIEdMX1NIT1JUOlxuICAgICAgICAgIGR0eXBlID0gR0xfVU5TSUdORURfU0hPUlRcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgR0xfVU5TSUdORURfSU5UOlxuICAgICAgICBjYXNlIEdMX0lOVDpcbiAgICAgICAgICBkdHlwZSA9IEdMX1VOU0lHTkVEX0lOVFxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBcbiAgICAgIH1cbiAgICAgIGVsZW1lbnRzLmJ1ZmZlci5kdHlwZSA9IGR0eXBlXG4gICAgfVxuICAgIGVsZW1lbnRzLnR5cGUgPSBkdHlwZVxuXG4gICAgLy8gQ2hlY2sgb2VzX2VsZW1lbnRfaW5kZXhfdWludCBleHRlbnNpb25cbiAgICBcblxuICAgIC8vIHRyeSB0byBndWVzcyBkZWZhdWx0IHByaW1pdGl2ZSB0eXBlIGFuZCBhcmd1bWVudHNcbiAgICB2YXIgdmVydENvdW50ID0gY291bnRcbiAgICBpZiAodmVydENvdW50IDwgMCkge1xuICAgICAgdmVydENvdW50ID0gZWxlbWVudHMuYnVmZmVyLmJ5dGVMZW5ndGhcbiAgICAgIGlmIChkdHlwZSA9PT0gR0xfVU5TSUdORURfU0hPUlQpIHtcbiAgICAgICAgdmVydENvdW50ID4+PSAxXG4gICAgICB9IGVsc2UgaWYgKGR0eXBlID09PSBHTF9VTlNJR05FRF9JTlQpIHtcbiAgICAgICAgdmVydENvdW50ID4+PSAyXG4gICAgICB9XG4gICAgfVxuICAgIGVsZW1lbnRzLnZlcnRDb3VudCA9IHZlcnRDb3VudFxuXG4gICAgLy8gdHJ5IHRvIGd1ZXNzIHByaW1pdGl2ZSB0eXBlIGZyb20gY2VsbCBkaW1lbnNpb25cbiAgICB2YXIgcHJpbVR5cGUgPSBwcmltXG4gICAgaWYgKHByaW0gPCAwKSB7XG4gICAgICBwcmltVHlwZSA9IEdMX1RSSUFOR0xFU1xuICAgICAgdmFyIGRpbWVuc2lvbiA9IGVsZW1lbnRzLmJ1ZmZlci5kaW1lbnNpb25cbiAgICAgIGlmIChkaW1lbnNpb24gPT09IDEpIHByaW1UeXBlID0gR0xfUE9JTlRTXG4gICAgICBpZiAoZGltZW5zaW9uID09PSAyKSBwcmltVHlwZSA9IEdMX0xJTkVTXG4gICAgICBpZiAoZGltZW5zaW9uID09PSAzKSBwcmltVHlwZSA9IEdMX1RSSUFOR0xFU1xuICAgIH1cbiAgICBlbGVtZW50cy5wcmltVHlwZSA9IHByaW1UeXBlXG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95RWxlbWVudHMgKGVsZW1lbnRzKSB7XG4gICAgc3RhdHMuZWxlbWVudHNDb3VudC0tXG5cbiAgICBcbiAgICBkZWxldGUgZWxlbWVudFNldFtlbGVtZW50cy5pZF1cbiAgICBlbGVtZW50cy5idWZmZXIuZGVzdHJveSgpXG4gICAgZWxlbWVudHMuYnVmZmVyID0gbnVsbFxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRWxlbWVudHMgKG9wdGlvbnMsIHBlcnNpc3RlbnQpIHtcbiAgICB2YXIgYnVmZmVyID0gYnVmZmVyU3RhdGUuY3JlYXRlKG51bGwsIEdMX0VMRU1FTlRfQVJSQVlfQlVGRkVSLCB0cnVlKVxuICAgIHZhciBlbGVtZW50cyA9IG5ldyBSRUdMRWxlbWVudEJ1ZmZlcihidWZmZXIuX2J1ZmZlcilcbiAgICBzdGF0cy5lbGVtZW50c0NvdW50KytcblxuICAgIGZ1bmN0aW9uIHJlZ2xFbGVtZW50cyAob3B0aW9ucykge1xuICAgICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICAgIGJ1ZmZlcigpXG4gICAgICAgIGVsZW1lbnRzLnByaW1UeXBlID0gR0xfVFJJQU5HTEVTXG4gICAgICAgIGVsZW1lbnRzLnZlcnRDb3VudCA9IDBcbiAgICAgICAgZWxlbWVudHMudHlwZSA9IEdMX1VOU0lHTkVEX0JZVEVcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGJ1ZmZlcihvcHRpb25zKVxuICAgICAgICBlbGVtZW50cy5wcmltVHlwZSA9IEdMX1RSSUFOR0xFU1xuICAgICAgICBlbGVtZW50cy52ZXJ0Q291bnQgPSBvcHRpb25zIHwgMFxuICAgICAgICBlbGVtZW50cy50eXBlID0gR0xfVU5TSUdORURfQllURVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGRhdGEgPSBudWxsXG4gICAgICAgIHZhciB1c2FnZSA9IEdMX1NUQVRJQ19EUkFXXG4gICAgICAgIHZhciBwcmltVHlwZSA9IC0xXG4gICAgICAgIHZhciB2ZXJ0Q291bnQgPSAtMVxuICAgICAgICB2YXIgYnl0ZUxlbmd0aCA9IDBcbiAgICAgICAgdmFyIGR0eXBlID0gMFxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSB8fFxuICAgICAgICAgICAgaXNUeXBlZEFycmF5KG9wdGlvbnMpIHx8XG4gICAgICAgICAgICBpc05EQXJyYXlMaWtlKG9wdGlvbnMpKSB7XG4gICAgICAgICAgZGF0YSA9IG9wdGlvbnNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoJ2RhdGEnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGRhdGEgPSBvcHRpb25zLmRhdGFcbiAgICAgICAgICAgIFxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJ3VzYWdlJyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHVzYWdlID0gdXNhZ2VUeXBlc1tvcHRpb25zLnVzYWdlXVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJ3ByaW1pdGl2ZScgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmltVHlwZSA9IHByaW1UeXBlc1tvcHRpb25zLnByaW1pdGl2ZV1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCdjb3VudCcgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2ZXJ0Q291bnQgPSBvcHRpb25zLmNvdW50IHwgMFxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJ2xlbmd0aCcgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgYnl0ZUxlbmd0aCA9IG9wdGlvbnMubGVuZ3RoIHwgMFxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJ3R5cGUnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZHR5cGUgPSBlbGVtZW50VHlwZXNbb3B0aW9ucy50eXBlXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgIGluaXRFbGVtZW50cyhcbiAgICAgICAgICAgIGVsZW1lbnRzLFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHVzYWdlLFxuICAgICAgICAgICAgcHJpbVR5cGUsXG4gICAgICAgICAgICB2ZXJ0Q291bnQsXG4gICAgICAgICAgICBieXRlTGVuZ3RoLFxuICAgICAgICAgICAgZHR5cGUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIF9idWZmZXIgPSBlbGVtZW50cy5idWZmZXJcbiAgICAgICAgICBfYnVmZmVyLmJpbmQoKVxuICAgICAgICAgIGdsLmJ1ZmZlckRhdGEoR0xfRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGJ5dGVMZW5ndGgsIHVzYWdlKVxuICAgICAgICAgIF9idWZmZXIuZHR5cGUgPSBkdHlwZSB8fCBHTF9VTlNJR05FRF9CWVRFXG4gICAgICAgICAgX2J1ZmZlci51c2FnZSA9IHVzYWdlXG4gICAgICAgICAgX2J1ZmZlci5kaW1lbnNpb24gPSAzXG4gICAgICAgICAgX2J1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuICAgICAgICAgIGVsZW1lbnRzLnByaW1UeXBlID0gcHJpbVR5cGUgPCAwID8gR0xfVFJJQU5HTEVTIDogcHJpbVR5cGVcbiAgICAgICAgICBlbGVtZW50cy52ZXJ0Q291bnQgPSB2ZXJ0Q291bnQgPCAwID8gMCA6IHZlcnRDb3VudFxuICAgICAgICAgIGVsZW1lbnRzLnR5cGUgPSBfYnVmZmVyLmR0eXBlXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlZ2xFbGVtZW50c1xuICAgIH1cblxuICAgIHJlZ2xFbGVtZW50cyhvcHRpb25zKVxuXG4gICAgcmVnbEVsZW1lbnRzLl9yZWdsVHlwZSA9ICdlbGVtZW50cydcbiAgICByZWdsRWxlbWVudHMuX2VsZW1lbnRzID0gZWxlbWVudHNcbiAgICByZWdsRWxlbWVudHMuc3ViZGF0YSA9IGZ1bmN0aW9uIChkYXRhLCBvZmZzZXQpIHtcbiAgICAgIGJ1ZmZlci5zdWJkYXRhKGRhdGEsIG9mZnNldClcbiAgICAgIHJldHVybiByZWdsRWxlbWVudHNcbiAgICB9XG4gICAgcmVnbEVsZW1lbnRzLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBkZXN0cm95RWxlbWVudHMoZWxlbWVudHMpXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZ2xFbGVtZW50c1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjcmVhdGU6IGNyZWF0ZUVsZW1lbnRzLFxuICAgIGNyZWF0ZVN0cmVhbTogY3JlYXRlRWxlbWVudFN0cmVhbSxcbiAgICBkZXN0cm95U3RyZWFtOiBkZXN0cm95RWxlbWVudFN0cmVhbSxcbiAgICBnZXRFbGVtZW50czogZnVuY3Rpb24gKGVsZW1lbnRzKSB7XG4gICAgICBpZiAodHlwZW9mIGVsZW1lbnRzID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgZWxlbWVudHMuX2VsZW1lbnRzIGluc3RhbmNlb2YgUkVHTEVsZW1lbnRCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRzLl9lbGVtZW50c1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YWx1ZXMoZWxlbWVudFNldCkuZm9yRWFjaChkZXN0cm95RWxlbWVudHMpXG4gICAgfVxuICB9XG59XG4iLCJcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFeHRlbnNpb25DYWNoZSAoZ2wsIGNvbmZpZykge1xuICB2YXIgZXh0ZW5zaW9ucyA9IHt9XG5cbiAgZnVuY3Rpb24gdHJ5TG9hZEV4dGVuc2lvbiAobmFtZV8pIHtcbiAgICBcbiAgICB2YXIgbmFtZSA9IG5hbWVfLnRvTG93ZXJDYXNlKClcbiAgICB2YXIgZXh0XG4gICAgdHJ5IHtcbiAgICAgIGV4dCA9IGV4dGVuc2lvbnNbbmFtZV0gPSBnbC5nZXRFeHRlbnNpb24obmFtZSlcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHJldHVybiAhIWV4dFxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcuZXh0ZW5zaW9ucy5sZW5ndGg7ICsraSkge1xuICAgIHZhciBuYW1lID0gY29uZmlnLmV4dGVuc2lvbnNbaV1cbiAgICBpZiAoIXRyeUxvYWRFeHRlbnNpb24obmFtZSkpIHtcbiAgICAgIGNvbmZpZy5vbkRlc3Ryb3koKVxuICAgICAgY29uZmlnLm9uRG9uZSgnXCInICsgbmFtZSArICdcIiBleHRlbnNpb24gaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgY3VycmVudCBXZWJHTCBjb250ZXh0LCB0cnkgdXBncmFkaW5nIHlvdXIgc3lzdGVtIG9yIGEgZGlmZmVyZW50IGJyb3dzZXInKVxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICBjb25maWcub3B0aW9uYWxFeHRlbnNpb25zLmZvckVhY2godHJ5TG9hZEV4dGVuc2lvbilcblxuICByZXR1cm4ge1xuICAgIGV4dGVuc2lvbnM6IGV4dGVuc2lvbnMsXG4gICAgcmVzdG9yZTogZnVuY3Rpb24gKCkge1xuICAgICAgT2JqZWN0LmtleXMoZXh0ZW5zaW9ucykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBpZiAoIXRyeUxvYWRFeHRlbnNpb24obmFtZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJyhyZWdsKTogZXJyb3IgcmVzdG9yaW5nIGV4dGVuc2lvbiAnICsgbmFtZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cbiIsIlxudmFyIHZhbHVlcyA9IHJlcXVpcmUoJy4vdXRpbC92YWx1ZXMnKVxudmFyIGV4dGVuZCA9IHJlcXVpcmUoJy4vdXRpbC9leHRlbmQnKVxuXG4vLyBXZSBzdG9yZSB0aGVzZSBjb25zdGFudHMgc28gdGhhdCB0aGUgbWluaWZpZXIgY2FuIGlubGluZSB0aGVtXG52YXIgR0xfRlJBTUVCVUZGRVIgPSAweDhENDBcbnZhciBHTF9SRU5ERVJCVUZGRVIgPSAweDhENDFcblxudmFyIEdMX1RFWFRVUkVfMkQgPSAweDBERTFcbnZhciBHTF9URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggPSAweDg1MTVcblxudmFyIEdMX0NPTE9SX0FUVEFDSE1FTlQwID0gMHg4Q0UwXG52YXIgR0xfREVQVEhfQVRUQUNITUVOVCA9IDB4OEQwMFxudmFyIEdMX1NURU5DSUxfQVRUQUNITUVOVCA9IDB4OEQyMFxudmFyIEdMX0RFUFRIX1NURU5DSUxfQVRUQUNITUVOVCA9IDB4ODIxQVxuXG52YXIgR0xfRlJBTUVCVUZGRVJfQ09NUExFVEUgPSAweDhDRDVcbnZhciBHTF9GUkFNRUJVRkZFUl9JTkNPTVBMRVRFX0FUVEFDSE1FTlQgPSAweDhDRDZcbnZhciBHTF9GUkFNRUJVRkZFUl9JTkNPTVBMRVRFX01JU1NJTkdfQVRUQUNITUVOVCA9IDB4OENEN1xudmFyIEdMX0ZSQU1FQlVGRkVSX0lOQ09NUExFVEVfRElNRU5TSU9OUyA9IDB4OENEOVxudmFyIEdMX0ZSQU1FQlVGRkVSX1VOU1VQUE9SVEVEID0gMHg4Q0REXG5cbnZhciBHTF9IQUxGX0ZMT0FUX09FUyA9IDB4OEQ2MVxudmFyIEdMX1VOU0lHTkVEX0JZVEUgPSAweDE0MDFcbnZhciBHTF9GTE9BVCA9IDB4MTQwNlxuXG52YXIgR0xfUkdCQSA9IDB4MTkwOFxuXG52YXIgR0xfREVQVEhfQ09NUE9ORU5UID0gMHgxOTAyXG5cbnZhciBjb2xvclRleHR1cmVGb3JtYXRFbnVtcyA9IFtcbiAgR0xfUkdCQVxuXVxuXG4vLyBmb3IgZXZlcnkgdGV4dHVyZSBmb3JtYXQsIHN0b3JlXG4vLyB0aGUgbnVtYmVyIG9mIGNoYW5uZWxzXG52YXIgdGV4dHVyZUZvcm1hdENoYW5uZWxzID0gW11cbnRleHR1cmVGb3JtYXRDaGFubmVsc1tHTF9SR0JBXSA9IDRcblxuLy8gZm9yIGV2ZXJ5IHRleHR1cmUgdHlwZSwgc3RvcmVcbi8vIHRoZSBzaXplIGluIGJ5dGVzLlxudmFyIHRleHR1cmVUeXBlU2l6ZXMgPSBbXVxudGV4dHVyZVR5cGVTaXplc1tHTF9VTlNJR05FRF9CWVRFXSA9IDFcbnRleHR1cmVUeXBlU2l6ZXNbR0xfRkxPQVRdID0gNFxudGV4dHVyZVR5cGVTaXplc1tHTF9IQUxGX0ZMT0FUX09FU10gPSAyXG5cbnZhciBHTF9SR0JBNCA9IDB4ODA1NlxudmFyIEdMX1JHQjVfQTEgPSAweDgwNTdcbnZhciBHTF9SR0I1NjUgPSAweDhENjJcbnZhciBHTF9ERVBUSF9DT01QT05FTlQxNiA9IDB4ODFBNVxudmFyIEdMX1NURU5DSUxfSU5ERVg4ID0gMHg4RDQ4XG52YXIgR0xfREVQVEhfU1RFTkNJTCA9IDB4ODRGOVxuXG52YXIgR0xfU1JHQjhfQUxQSEE4X0VYVCA9IDB4OEM0M1xuXG52YXIgR0xfUkdCQTMyRl9FWFQgPSAweDg4MTRcblxudmFyIEdMX1JHQkExNkZfRVhUID0gMHg4ODFBXG52YXIgR0xfUkdCMTZGX0VYVCA9IDB4ODgxQlxuXG52YXIgY29sb3JSZW5kZXJidWZmZXJGb3JtYXRFbnVtcyA9IFtcbiAgR0xfUkdCQTQsXG4gIEdMX1JHQjVfQTEsXG4gIEdMX1JHQjU2NSxcbiAgR0xfU1JHQjhfQUxQSEE4X0VYVCxcbiAgR0xfUkdCQTE2Rl9FWFQsXG4gIEdMX1JHQjE2Rl9FWFQsXG4gIEdMX1JHQkEzMkZfRVhUXG5dXG5cbnZhciBzdGF0dXNDb2RlID0ge31cbnN0YXR1c0NvZGVbR0xfRlJBTUVCVUZGRVJfQ09NUExFVEVdID0gJ2NvbXBsZXRlJ1xuc3RhdHVzQ29kZVtHTF9GUkFNRUJVRkZFUl9JTkNPTVBMRVRFX0FUVEFDSE1FTlRdID0gJ2luY29tcGxldGUgYXR0YWNobWVudCdcbnN0YXR1c0NvZGVbR0xfRlJBTUVCVUZGRVJfSU5DT01QTEVURV9ESU1FTlNJT05TXSA9ICdpbmNvbXBsZXRlIGRpbWVuc2lvbnMnXG5zdGF0dXNDb2RlW0dMX0ZSQU1FQlVGRkVSX0lOQ09NUExFVEVfTUlTU0lOR19BVFRBQ0hNRU5UXSA9ICdpbmNvbXBsZXRlLCBtaXNzaW5nIGF0dGFjaG1lbnQnXG5zdGF0dXNDb2RlW0dMX0ZSQU1FQlVGRkVSX1VOU1VQUE9SVEVEXSA9ICd1bnN1cHBvcnRlZCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3cmFwRkJPU3RhdGUgKFxuICBnbCxcbiAgZXh0ZW5zaW9ucyxcbiAgbGltaXRzLFxuICB0ZXh0dXJlU3RhdGUsXG4gIHJlbmRlcmJ1ZmZlclN0YXRlLFxuICBzdGF0cykge1xuICB2YXIgZnJhbWVidWZmZXJTdGF0ZSA9IHtcbiAgICBjdXI6IG51bGwsXG4gICAgbmV4dDogbnVsbCxcbiAgICBkaXJ0eTogZmFsc2VcbiAgfVxuXG4gIHZhciBjb2xvclRleHR1cmVGb3JtYXRzID0gWydyZ2JhJ11cbiAgdmFyIGNvbG9yUmVuZGVyYnVmZmVyRm9ybWF0cyA9IFsncmdiYTQnLCAncmdiNTY1JywgJ3JnYjUgYTEnXVxuXG4gIGlmIChleHRlbnNpb25zLmV4dF9zcmdiKSB7XG4gICAgY29sb3JSZW5kZXJidWZmZXJGb3JtYXRzLnB1c2goJ3NyZ2JhJylcbiAgfVxuXG4gIGlmIChleHRlbnNpb25zLmV4dF9jb2xvcl9idWZmZXJfaGFsZl9mbG9hdCkge1xuICAgIGNvbG9yUmVuZGVyYnVmZmVyRm9ybWF0cy5wdXNoKCdyZ2JhMTZmJywgJ3JnYjE2ZicpXG4gIH1cblxuICBpZiAoZXh0ZW5zaW9ucy53ZWJnbF9jb2xvcl9idWZmZXJfZmxvYXQpIHtcbiAgICBjb2xvclJlbmRlcmJ1ZmZlckZvcm1hdHMucHVzaCgncmdiYTMyZicpXG4gIH1cblxuICB2YXIgY29sb3JUeXBlcyA9IFsndWludDgnXVxuICBpZiAoZXh0ZW5zaW9ucy5vZXNfdGV4dHVyZV9oYWxmX2Zsb2F0KSB7XG4gICAgY29sb3JUeXBlcy5wdXNoKCdoYWxmIGZsb2F0JywgJ2Zsb2F0MTYnKVxuICB9XG4gIGlmIChleHRlbnNpb25zLm9lc190ZXh0dXJlX2Zsb2F0KSB7XG4gICAgY29sb3JUeXBlcy5wdXNoKCdmbG9hdCcsICdmbG9hdDMyJylcbiAgfVxuXG4gIGZ1bmN0aW9uIEZyYW1lYnVmZmVyQXR0YWNobWVudCAodGFyZ2V0LCB0ZXh0dXJlLCByZW5kZXJidWZmZXIpIHtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICAgIHRoaXMudGV4dHVyZSA9IHRleHR1cmVcbiAgICB0aGlzLnJlbmRlcmJ1ZmZlciA9IHJlbmRlcmJ1ZmZlclxuXG4gICAgdmFyIHcgPSAwXG4gICAgdmFyIGggPSAwXG4gICAgaWYgKHRleHR1cmUpIHtcbiAgICAgIHcgPSB0ZXh0dXJlLndpZHRoXG4gICAgICBoID0gdGV4dHVyZS5oZWlnaHRcbiAgICB9IGVsc2UgaWYgKHJlbmRlcmJ1ZmZlcikge1xuICAgICAgdyA9IHJlbmRlcmJ1ZmZlci53aWR0aFxuICAgICAgaCA9IHJlbmRlcmJ1ZmZlci5oZWlnaHRcbiAgICB9XG4gICAgdGhpcy53aWR0aCA9IHdcbiAgICB0aGlzLmhlaWdodCA9IGhcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY1JlZiAoYXR0YWNobWVudCkge1xuICAgIGlmIChhdHRhY2htZW50KSB7XG4gICAgICBpZiAoYXR0YWNobWVudC50ZXh0dXJlKSB7XG4gICAgICAgIGF0dGFjaG1lbnQudGV4dHVyZS5fdGV4dHVyZS5kZWNSZWYoKVxuICAgICAgfVxuICAgICAgaWYgKGF0dGFjaG1lbnQucmVuZGVyYnVmZmVyKSB7XG4gICAgICAgIGF0dGFjaG1lbnQucmVuZGVyYnVmZmVyLl9yZW5kZXJidWZmZXIuZGVjUmVmKClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbmNSZWZBbmRDaGVja1NoYXBlIChhdHRhY2htZW50LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgaWYgKCFhdHRhY2htZW50KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKGF0dGFjaG1lbnQudGV4dHVyZSkge1xuICAgICAgdmFyIHRleHR1cmUgPSBhdHRhY2htZW50LnRleHR1cmUuX3RleHR1cmVcbiAgICAgIHZhciB0dyA9IE1hdGgubWF4KDEsIHRleHR1cmUud2lkdGgpXG4gICAgICB2YXIgdGggPSBNYXRoLm1heCgxLCB0ZXh0dXJlLmhlaWdodClcbiAgICAgIFxuICAgICAgdGV4dHVyZS5yZWZDb3VudCArPSAxXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZW5kZXJidWZmZXIgPSBhdHRhY2htZW50LnJlbmRlcmJ1ZmZlci5fcmVuZGVyYnVmZmVyXG4gICAgICBcbiAgICAgIHJlbmRlcmJ1ZmZlci5yZWZDb3VudCArPSAxXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYXR0YWNoIChsb2NhdGlvbiwgYXR0YWNobWVudCkge1xuICAgIGlmIChhdHRhY2htZW50KSB7XG4gICAgICBpZiAoYXR0YWNobWVudC50ZXh0dXJlKSB7XG4gICAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxuICAgICAgICAgIEdMX0ZSQU1FQlVGRkVSLFxuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGF0dGFjaG1lbnQudGFyZ2V0LFxuICAgICAgICAgIGF0dGFjaG1lbnQudGV4dHVyZS5fdGV4dHVyZS50ZXh0dXJlLFxuICAgICAgICAgIDApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnbC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihcbiAgICAgICAgICBHTF9GUkFNRUJVRkZFUixcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBHTF9SRU5ERVJCVUZGRVIsXG4gICAgICAgICAgYXR0YWNobWVudC5yZW5kZXJidWZmZXIuX3JlbmRlcmJ1ZmZlci5yZW5kZXJidWZmZXIpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxuICAgICAgICBHTF9GUkFNRUJVRkZFUixcbiAgICAgICAgbG9jYXRpb24sXG4gICAgICAgIEdMX1RFWFRVUkVfMkQsXG4gICAgICAgIG51bGwsXG4gICAgICAgIDApXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VBdHRhY2htZW50IChhdHRhY2htZW50KSB7XG4gICAgdmFyIHRhcmdldCA9IEdMX1RFWFRVUkVfMkRcbiAgICB2YXIgdGV4dHVyZSA9IG51bGxcbiAgICB2YXIgcmVuZGVyYnVmZmVyID0gbnVsbFxuXG4gICAgdmFyIGRhdGEgPSBhdHRhY2htZW50XG4gICAgaWYgKHR5cGVvZiBhdHRhY2htZW50ID09PSAnb2JqZWN0Jykge1xuICAgICAgZGF0YSA9IGF0dGFjaG1lbnQuZGF0YVxuICAgICAgaWYgKCd0YXJnZXQnIGluIGF0dGFjaG1lbnQpIHtcbiAgICAgICAgdGFyZ2V0ID0gYXR0YWNobWVudC50YXJnZXQgfCAwXG4gICAgICB9XG4gICAgfVxuXG4gICAgXG5cbiAgICB2YXIgdHlwZSA9IGRhdGEuX3JlZ2xUeXBlXG4gICAgaWYgKHR5cGUgPT09ICd0ZXh0dXJlMmQnKSB7XG4gICAgICB0ZXh0dXJlID0gZGF0YVxuICAgICAgXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAndGV4dHVyZUN1YmUnKSB7XG4gICAgICB0ZXh0dXJlID0gZGF0YVxuICAgICAgXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAncmVuZGVyYnVmZmVyJykge1xuICAgICAgcmVuZGVyYnVmZmVyID0gZGF0YVxuICAgICAgdGFyZ2V0ID0gR0xfUkVOREVSQlVGRkVSXG4gICAgfSBlbHNlIHtcbiAgICAgIFxuICAgIH1cblxuICAgIHJldHVybiBuZXcgRnJhbWVidWZmZXJBdHRhY2htZW50KHRhcmdldCwgdGV4dHVyZSwgcmVuZGVyYnVmZmVyKVxuICB9XG5cbiAgZnVuY3Rpb24gYWxsb2NBdHRhY2htZW50IChcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgaXNUZXh0dXJlLFxuICAgIGZvcm1hdCxcbiAgICB0eXBlKSB7XG4gICAgaWYgKGlzVGV4dHVyZSkge1xuICAgICAgdmFyIHRleHR1cmUgPSB0ZXh0dXJlU3RhdGUuY3JlYXRlMkQoe1xuICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICAgICAgdHlwZTogdHlwZVxuICAgICAgfSlcbiAgICAgIHRleHR1cmUuX3RleHR1cmUucmVmQ291bnQgPSAwXG4gICAgICByZXR1cm4gbmV3IEZyYW1lYnVmZmVyQXR0YWNobWVudChHTF9URVhUVVJFXzJELCB0ZXh0dXJlLCBudWxsKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmIgPSByZW5kZXJidWZmZXJTdGF0ZS5jcmVhdGUoe1xuICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICBmb3JtYXQ6IGZvcm1hdFxuICAgICAgfSlcbiAgICAgIHJiLl9yZW5kZXJidWZmZXIucmVmQ291bnQgPSAwXG4gICAgICByZXR1cm4gbmV3IEZyYW1lYnVmZmVyQXR0YWNobWVudChHTF9SRU5ERVJCVUZGRVIsIG51bGwsIHJiKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVud3JhcEF0dGFjaG1lbnQgKGF0dGFjaG1lbnQpIHtcbiAgICByZXR1cm4gYXR0YWNobWVudCAmJiAoYXR0YWNobWVudC50ZXh0dXJlIHx8IGF0dGFjaG1lbnQucmVuZGVyYnVmZmVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzaXplQXR0YWNobWVudCAoYXR0YWNobWVudCwgdywgaCkge1xuICAgIGlmIChhdHRhY2htZW50KSB7XG4gICAgICBpZiAoYXR0YWNobWVudC50ZXh0dXJlKSB7XG4gICAgICAgIGF0dGFjaG1lbnQudGV4dHVyZS5yZXNpemUodywgaClcbiAgICAgIH0gZWxzZSBpZiAoYXR0YWNobWVudC5yZW5kZXJidWZmZXIpIHtcbiAgICAgICAgYXR0YWNobWVudC5yZW5kZXJidWZmZXIucmVzaXplKHcsIGgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGZyYW1lYnVmZmVyQ291bnQgPSAwXG4gIHZhciBmcmFtZWJ1ZmZlclNldCA9IHt9XG5cbiAgZnVuY3Rpb24gUkVHTEZyYW1lYnVmZmVyICgpIHtcbiAgICB0aGlzLmlkID0gZnJhbWVidWZmZXJDb3VudCsrXG4gICAgZnJhbWVidWZmZXJTZXRbdGhpcy5pZF0gPSB0aGlzXG5cbiAgICB0aGlzLmZyYW1lYnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKVxuICAgIHRoaXMud2lkdGggPSAwXG4gICAgdGhpcy5oZWlnaHQgPSAwXG5cbiAgICB0aGlzLmNvbG9yQXR0YWNobWVudHMgPSBbXVxuICAgIHRoaXMuZGVwdGhBdHRhY2htZW50ID0gbnVsbFxuICAgIHRoaXMuc3RlbmNpbEF0dGFjaG1lbnQgPSBudWxsXG4gICAgdGhpcy5kZXB0aFN0ZW5jaWxBdHRhY2htZW50ID0gbnVsbFxuICB9XG5cbiAgZnVuY3Rpb24gZGVjRkJPUmVmcyAoZnJhbWVidWZmZXIpIHtcbiAgICBmcmFtZWJ1ZmZlci5jb2xvckF0dGFjaG1lbnRzLmZvckVhY2goZGVjUmVmKVxuICAgIGRlY1JlZihmcmFtZWJ1ZmZlci5kZXB0aEF0dGFjaG1lbnQpXG4gICAgZGVjUmVmKGZyYW1lYnVmZmVyLnN0ZW5jaWxBdHRhY2htZW50KVxuICAgIGRlY1JlZihmcmFtZWJ1ZmZlci5kZXB0aFN0ZW5jaWxBdHRhY2htZW50KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVzdHJveSAoZnJhbWVidWZmZXIpIHtcbiAgICB2YXIgaGFuZGxlID0gZnJhbWVidWZmZXIuZnJhbWVidWZmZXJcbiAgICBcbiAgICBnbC5kZWxldGVGcmFtZWJ1ZmZlcihoYW5kbGUpXG4gICAgZnJhbWVidWZmZXIuZnJhbWVidWZmZXIgPSBudWxsXG4gICAgc3RhdHMuZnJhbWVidWZmZXJDb3VudC0tXG4gICAgZGVsZXRlIGZyYW1lYnVmZmVyU2V0W2ZyYW1lYnVmZmVyLmlkXVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlRnJhbWVidWZmZXIgKGZyYW1lYnVmZmVyKSB7XG4gICAgdmFyIGlcblxuICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihHTF9GUkFNRUJVRkZFUiwgZnJhbWVidWZmZXIuZnJhbWVidWZmZXIpXG4gICAgdmFyIGNvbG9yQXR0YWNobWVudHMgPSBmcmFtZWJ1ZmZlci5jb2xvckF0dGFjaG1lbnRzXG4gICAgZm9yIChpID0gMDsgaSA8IGNvbG9yQXR0YWNobWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGF0dGFjaChHTF9DT0xPUl9BVFRBQ0hNRU5UMCArIGksIGNvbG9yQXR0YWNobWVudHNbaV0pXG4gICAgfVxuICAgIGZvciAoaSA9IGNvbG9yQXR0YWNobWVudHMubGVuZ3RoOyBpIDwgbGltaXRzLm1heENvbG9yQXR0YWNobWVudHM7ICsraSkge1xuICAgICAgYXR0YWNoKEdMX0NPTE9SX0FUVEFDSE1FTlQwICsgaSwgbnVsbClcbiAgICB9XG4gICAgYXR0YWNoKEdMX0RFUFRIX0FUVEFDSE1FTlQsIGZyYW1lYnVmZmVyLmRlcHRoQXR0YWNobWVudClcbiAgICBhdHRhY2goR0xfU1RFTkNJTF9BVFRBQ0hNRU5ULCBmcmFtZWJ1ZmZlci5zdGVuY2lsQXR0YWNobWVudClcbiAgICBhdHRhY2goR0xfREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5ULCBmcmFtZWJ1ZmZlci5kZXB0aFN0ZW5jaWxBdHRhY2htZW50KVxuXG4gICAgLy8gQ2hlY2sgc3RhdHVzIGNvZGVcbiAgICB2YXIgc3RhdHVzID0gZ2wuY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cyhHTF9GUkFNRUJVRkZFUilcbiAgICBpZiAoc3RhdHVzICE9PSBHTF9GUkFNRUJVRkZFUl9DT01QTEVURSkge1xuICAgICAgXG4gICAgfVxuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKEdMX0ZSQU1FQlVGRkVSLCBmcmFtZWJ1ZmZlclN0YXRlLm5leHQpXG4gICAgZnJhbWVidWZmZXJTdGF0ZS5jdXIgPSBmcmFtZWJ1ZmZlclN0YXRlLm5leHRcblxuICAgIC8vIEZJWE1FOiBDbGVhciBlcnJvciBjb2RlIGhlcmUuICBUaGlzIGlzIGEgd29yayBhcm91bmQgZm9yIGEgYnVnIGluXG4gICAgLy8gaGVhZGxlc3MtZ2xcbiAgICBnbC5nZXRFcnJvcigpXG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVGQk8gKGEwLCBhMSkge1xuICAgIHZhciBmcmFtZWJ1ZmZlciA9IG5ldyBSRUdMRnJhbWVidWZmZXIoKVxuICAgIHN0YXRzLmZyYW1lYnVmZmVyQ291bnQrK1xuXG4gICAgZnVuY3Rpb24gcmVnbEZyYW1lYnVmZmVyIChhLCBiKSB7XG4gICAgICB2YXIgaVxuXG4gICAgICBcblxuICAgICAgdmFyIGV4dERyYXdCdWZmZXJzID0gZXh0ZW5zaW9ucy53ZWJnbF9kcmF3X2J1ZmZlcnNcblxuICAgICAgdmFyIHdpZHRoID0gMFxuICAgICAgdmFyIGhlaWdodCA9IDBcblxuICAgICAgdmFyIG5lZWRzRGVwdGggPSB0cnVlXG4gICAgICB2YXIgbmVlZHNTdGVuY2lsID0gdHJ1ZVxuXG4gICAgICB2YXIgY29sb3JCdWZmZXIgPSBudWxsXG4gICAgICB2YXIgY29sb3JUZXh0dXJlID0gdHJ1ZVxuICAgICAgdmFyIGNvbG9yRm9ybWF0ID0gJ3JnYmEnXG4gICAgICB2YXIgY29sb3JUeXBlID0gJ3VpbnQ4J1xuICAgICAgdmFyIGNvbG9yQ291bnQgPSAxXG5cbiAgICAgIHZhciBkZXB0aEJ1ZmZlciA9IG51bGxcbiAgICAgIHZhciBzdGVuY2lsQnVmZmVyID0gbnVsbFxuICAgICAgdmFyIGRlcHRoU3RlbmNpbEJ1ZmZlciA9IG51bGxcbiAgICAgIHZhciBkZXB0aFN0ZW5jaWxUZXh0dXJlID0gZmFsc2VcblxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnbnVtYmVyJykge1xuICAgICAgICB3aWR0aCA9IGEgfCAwXG4gICAgICAgIGhlaWdodCA9IChiIHwgMCkgfHwgd2lkdGhcbiAgICAgIH0gZWxzZSBpZiAoIWEpIHtcbiAgICAgICAgd2lkdGggPSBoZWlnaHQgPSAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBhXG5cbiAgICAgICAgaWYgKCdzaGFwZScgaW4gb3B0aW9ucykge1xuICAgICAgICAgIHZhciBzaGFwZSA9IG9wdGlvbnMuc2hhcGVcbiAgICAgICAgICBcbiAgICAgICAgICB3aWR0aCA9IHNoYXBlWzBdXG4gICAgICAgICAgaGVpZ2h0ID0gc2hhcGVbMV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoJ3JhZGl1cycgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgd2lkdGggPSBoZWlnaHQgPSBvcHRpb25zLnJhZGl1c1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoJ3dpZHRoJyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICB3aWR0aCA9IG9wdGlvbnMud2lkdGhcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCdoZWlnaHQnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCdjb2xvcicgaW4gb3B0aW9ucyB8fFxuICAgICAgICAgICAgJ2NvbG9ycycgaW4gb3B0aW9ucykge1xuICAgICAgICAgIGNvbG9yQnVmZmVyID1cbiAgICAgICAgICAgIG9wdGlvbnMuY29sb3IgfHxcbiAgICAgICAgICAgIG9wdGlvbnMuY29sb3JzXG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29sb3JCdWZmZXIpKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNvbG9yQnVmZmVyKSB7XG4gICAgICAgICAgaWYgKCdjb2xvckNvdW50JyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb2xvckNvdW50ID0gb3B0aW9ucy5jb2xvckNvdW50IHwgMFxuICAgICAgICAgICAgXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCdjb2xvclRleHR1cmUnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbG9yVGV4dHVyZSA9ICEhb3B0aW9ucy5jb2xvclRleHR1cmVcbiAgICAgICAgICAgIGNvbG9yRm9ybWF0ID0gJ3JnYmE0J1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICgnY29sb3JUeXBlJyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb2xvclR5cGUgPSBvcHRpb25zLmNvbG9yVHlwZVxuICAgICAgICAgICAgaWYgKCFjb2xvclRleHR1cmUpIHtcbiAgICAgICAgICAgICAgaWYgKGNvbG9yVHlwZSA9PT0gJ2hhbGYgZmxvYXQnIHx8IGNvbG9yVHlwZSA9PT0gJ2Zsb2F0MTYnKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29sb3JGb3JtYXQgPSAncmdiYTE2ZidcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2xvclR5cGUgPT09ICdmbG9hdCcgfHwgY29sb3JUeXBlID09PSAnZmxvYXQzMicpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb2xvckZvcm1hdCA9ICdyZ2JhMzJmJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoJ2NvbG9yRm9ybWF0JyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb2xvckZvcm1hdCA9IG9wdGlvbnMuY29sb3JGb3JtYXRcbiAgICAgICAgICAgIGlmIChjb2xvclRleHR1cmVGb3JtYXRzLmluZGV4T2YoY29sb3JGb3JtYXQpID49IDApIHtcbiAgICAgICAgICAgICAgY29sb3JUZXh0dXJlID0gdHJ1ZVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjb2xvclJlbmRlcmJ1ZmZlckZvcm1hdHMuaW5kZXhPZihjb2xvckZvcm1hdCkgPj0gMCkge1xuICAgICAgICAgICAgICBjb2xvclRleHR1cmUgPSBmYWxzZVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGNvbG9yVGV4dHVyZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCdkZXB0aFRleHR1cmUnIGluIG9wdGlvbnMgfHwgJ2RlcHRoU3RlbmNpbFRleHR1cmUnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICBkZXB0aFN0ZW5jaWxUZXh0dXJlID0gISEob3B0aW9ucy5kZXB0aFRleHR1cmUgfHxcbiAgICAgICAgICAgIG9wdGlvbnMuZGVwdGhTdGVuY2lsVGV4dHVyZSlcbiAgICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgnZGVwdGgnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZGVwdGggPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgbmVlZHNEZXB0aCA9IG9wdGlvbnMuZGVwdGhcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVwdGhCdWZmZXIgPSBvcHRpb25zLmRlcHRoXG4gICAgICAgICAgICBuZWVkc1N0ZW5jaWwgPSBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgnc3RlbmNpbCcgaW4gb3B0aW9ucykge1xuICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5zdGVuY2lsID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIG5lZWRzU3RlbmNpbCA9IG9wdGlvbnMuc3RlbmNpbFxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGVuY2lsQnVmZmVyID0gb3B0aW9ucy5zdGVuY2lsXG4gICAgICAgICAgICBuZWVkc0RlcHRoID0gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJ2RlcHRoU3RlbmNpbCcgaW4gb3B0aW9ucykge1xuICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5kZXB0aFN0ZW5jaWwgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgbmVlZHNEZXB0aCA9IG5lZWRzU3RlbmNpbCA9IG9wdGlvbnMuZGVwdGhTdGVuY2lsXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlcHRoU3RlbmNpbEJ1ZmZlciA9IG9wdGlvbnMuZGVwdGhTdGVuY2lsXG4gICAgICAgICAgICBuZWVkc0RlcHRoID0gZmFsc2VcbiAgICAgICAgICAgIG5lZWRzU3RlbmNpbCA9IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHBhcnNlIGF0dGFjaG1lbnRzXG4gICAgICB2YXIgY29sb3JBdHRhY2htZW50cyA9IG51bGxcbiAgICAgIHZhciBkZXB0aEF0dGFjaG1lbnQgPSBudWxsXG4gICAgICB2YXIgc3RlbmNpbEF0dGFjaG1lbnQgPSBudWxsXG4gICAgICB2YXIgZGVwdGhTdGVuY2lsQXR0YWNobWVudCA9IG51bGxcblxuICAgICAgLy8gU2V0IHVwIGNvbG9yIGF0dGFjaG1lbnRzXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjb2xvckJ1ZmZlcikpIHtcbiAgICAgICAgY29sb3JBdHRhY2htZW50cyA9IGNvbG9yQnVmZmVyLm1hcChwYXJzZUF0dGFjaG1lbnQpXG4gICAgICB9IGVsc2UgaWYgKGNvbG9yQnVmZmVyKSB7XG4gICAgICAgIGNvbG9yQXR0YWNobWVudHMgPSBbcGFyc2VBdHRhY2htZW50KGNvbG9yQnVmZmVyKV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbG9yQXR0YWNobWVudHMgPSBuZXcgQXJyYXkoY29sb3JDb3VudClcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbG9yQ291bnQ7ICsraSkge1xuICAgICAgICAgIGNvbG9yQXR0YWNobWVudHNbaV0gPSBhbGxvY0F0dGFjaG1lbnQoXG4gICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgIGNvbG9yVGV4dHVyZSxcbiAgICAgICAgICAgIGNvbG9yRm9ybWF0LFxuICAgICAgICAgICAgY29sb3JUeXBlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIFxuICAgICAgXG5cbiAgICAgIHdpZHRoID0gd2lkdGggfHwgY29sb3JBdHRhY2htZW50c1swXS53aWR0aFxuICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IGNvbG9yQXR0YWNobWVudHNbMF0uaGVpZ2h0XG5cbiAgICAgIGlmIChkZXB0aEJ1ZmZlcikge1xuICAgICAgICBkZXB0aEF0dGFjaG1lbnQgPSBwYXJzZUF0dGFjaG1lbnQoZGVwdGhCdWZmZXIpXG4gICAgICB9IGVsc2UgaWYgKG5lZWRzRGVwdGggJiYgIW5lZWRzU3RlbmNpbCkge1xuICAgICAgICBkZXB0aEF0dGFjaG1lbnQgPSBhbGxvY0F0dGFjaG1lbnQoXG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgIGRlcHRoU3RlbmNpbFRleHR1cmUsXG4gICAgICAgICAgJ2RlcHRoJyxcbiAgICAgICAgICAndWludDMyJylcbiAgICAgIH1cblxuICAgICAgaWYgKHN0ZW5jaWxCdWZmZXIpIHtcbiAgICAgICAgc3RlbmNpbEF0dGFjaG1lbnQgPSBwYXJzZUF0dGFjaG1lbnQoc3RlbmNpbEJ1ZmZlcilcbiAgICAgIH0gZWxzZSBpZiAobmVlZHNTdGVuY2lsICYmICFuZWVkc0RlcHRoKSB7XG4gICAgICAgIHN0ZW5jaWxBdHRhY2htZW50ID0gYWxsb2NBdHRhY2htZW50KFxuICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAnc3RlbmNpbCcsXG4gICAgICAgICAgJ3VpbnQ4JylcbiAgICAgIH1cblxuICAgICAgaWYgKGRlcHRoU3RlbmNpbEJ1ZmZlcikge1xuICAgICAgICBkZXB0aFN0ZW5jaWxBdHRhY2htZW50ID0gcGFyc2VBdHRhY2htZW50KGRlcHRoU3RlbmNpbEJ1ZmZlcilcbiAgICAgIH0gZWxzZSBpZiAoIWRlcHRoQnVmZmVyICYmICFzdGVuY2lsQnVmZmVyICYmIG5lZWRzU3RlbmNpbCAmJiBuZWVkc0RlcHRoKSB7XG4gICAgICAgIGRlcHRoU3RlbmNpbEF0dGFjaG1lbnQgPSBhbGxvY0F0dGFjaG1lbnQoXG4gICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0LFxuICAgICAgICAgIGRlcHRoU3RlbmNpbFRleHR1cmUsXG4gICAgICAgICAgJ2RlcHRoIHN0ZW5jaWwnLFxuICAgICAgICAgICdkZXB0aCBzdGVuY2lsJylcbiAgICAgIH1cblxuICAgICAgXG5cbiAgICAgIHZhciBjb21tb25Db2xvckF0dGFjaG1lbnRTaXplID0gbnVsbFxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY29sb3JBdHRhY2htZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBpbmNSZWZBbmRDaGVja1NoYXBlKGNvbG9yQXR0YWNobWVudHNbaV0sIHdpZHRoLCBoZWlnaHQpXG4gICAgICAgIFxuXG4gICAgICAgIGlmIChjb2xvckF0dGFjaG1lbnRzW2ldICYmIGNvbG9yQXR0YWNobWVudHNbaV0udGV4dHVyZSkge1xuICAgICAgICAgIHZhciBjb2xvckF0dGFjaG1lbnRTaXplID1cbiAgICAgICAgICAgICAgdGV4dHVyZUZvcm1hdENoYW5uZWxzW2NvbG9yQXR0YWNobWVudHNbaV0udGV4dHVyZS5fdGV4dHVyZS5mb3JtYXRdICpcbiAgICAgICAgICAgICAgdGV4dHVyZVR5cGVTaXplc1tjb2xvckF0dGFjaG1lbnRzW2ldLnRleHR1cmUuX3RleHR1cmUudHlwZV1cblxuICAgICAgICAgIGlmIChjb21tb25Db2xvckF0dGFjaG1lbnRTaXplID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb21tb25Db2xvckF0dGFjaG1lbnRTaXplID0gY29sb3JBdHRhY2htZW50U2l6ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGFsbCBjb2xvciBhdHRhY2htZW50cyBoYXZlIHRoZSBzYW1lIG51bWJlciBvZiBiaXRwbGFuZXNcbiAgICAgICAgICAgIC8vICh0aGF0IGlzLCB0aGUgc2FtZSBudW1lciBvZiBiaXRzIHBlciBwaXhlbClcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgcmVxdWlyZWQgYnkgdGhlIEdMRVMyLjAgc3RhbmRhcmQuIFNlZSB0aGUgYmVnaW5uaW5nIG9mIENoYXB0ZXIgNCBpbiB0aGF0IGRvY3VtZW50LlxuICAgICAgICAgICAgXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpbmNSZWZBbmRDaGVja1NoYXBlKGRlcHRoQXR0YWNobWVudCwgd2lkdGgsIGhlaWdodClcbiAgICAgIFxuICAgICAgaW5jUmVmQW5kQ2hlY2tTaGFwZShzdGVuY2lsQXR0YWNobWVudCwgd2lkdGgsIGhlaWdodClcbiAgICAgIFxuICAgICAgaW5jUmVmQW5kQ2hlY2tTaGFwZShkZXB0aFN0ZW5jaWxBdHRhY2htZW50LCB3aWR0aCwgaGVpZ2h0KVxuICAgICAgXG5cbiAgICAgIC8vIGRlY3JlbWVudCByZWZlcmVuY2VzXG4gICAgICBkZWNGQk9SZWZzKGZyYW1lYnVmZmVyKVxuXG4gICAgICBmcmFtZWJ1ZmZlci53aWR0aCA9IHdpZHRoXG4gICAgICBmcmFtZWJ1ZmZlci5oZWlnaHQgPSBoZWlnaHRcblxuICAgICAgZnJhbWVidWZmZXIuY29sb3JBdHRhY2htZW50cyA9IGNvbG9yQXR0YWNobWVudHNcbiAgICAgIGZyYW1lYnVmZmVyLmRlcHRoQXR0YWNobWVudCA9IGRlcHRoQXR0YWNobWVudFxuICAgICAgZnJhbWVidWZmZXIuc3RlbmNpbEF0dGFjaG1lbnQgPSBzdGVuY2lsQXR0YWNobWVudFxuICAgICAgZnJhbWVidWZmZXIuZGVwdGhTdGVuY2lsQXR0YWNobWVudCA9IGRlcHRoU3RlbmNpbEF0dGFjaG1lbnRcblxuICAgICAgcmVnbEZyYW1lYnVmZmVyLmNvbG9yID0gY29sb3JBdHRhY2htZW50cy5tYXAodW53cmFwQXR0YWNobWVudClcbiAgICAgIHJlZ2xGcmFtZWJ1ZmZlci5kZXB0aCA9IHVud3JhcEF0dGFjaG1lbnQoZGVwdGhBdHRhY2htZW50KVxuICAgICAgcmVnbEZyYW1lYnVmZmVyLnN0ZW5jaWwgPSB1bndyYXBBdHRhY2htZW50KHN0ZW5jaWxBdHRhY2htZW50KVxuICAgICAgcmVnbEZyYW1lYnVmZmVyLmRlcHRoU3RlbmNpbCA9IHVud3JhcEF0dGFjaG1lbnQoZGVwdGhTdGVuY2lsQXR0YWNobWVudClcblxuICAgICAgcmVnbEZyYW1lYnVmZmVyLndpZHRoID0gZnJhbWVidWZmZXIud2lkdGhcbiAgICAgIHJlZ2xGcmFtZWJ1ZmZlci5oZWlnaHQgPSBmcmFtZWJ1ZmZlci5oZWlnaHRcblxuICAgICAgdXBkYXRlRnJhbWVidWZmZXIoZnJhbWVidWZmZXIpXG5cbiAgICAgIHJldHVybiByZWdsRnJhbWVidWZmZXJcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNpemUgKHdfLCBoXykge1xuICAgICAgXG5cbiAgICAgIHZhciB3ID0gd18gfCAwXG4gICAgICB2YXIgaCA9IChoXyB8IDApIHx8IHdcbiAgICAgIGlmICh3ID09PSBmcmFtZWJ1ZmZlci53aWR0aCAmJiBoID09PSBmcmFtZWJ1ZmZlci5oZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIHJlZ2xGcmFtZWJ1ZmZlclxuICAgICAgfVxuXG4gICAgICAvLyByZXNpemUgYWxsIGJ1ZmZlcnNcbiAgICAgIHZhciBjb2xvckF0dGFjaG1lbnRzID0gZnJhbWVidWZmZXIuY29sb3JBdHRhY2htZW50c1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xvckF0dGFjaG1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHJlc2l6ZUF0dGFjaG1lbnQoY29sb3JBdHRhY2htZW50c1tpXSwgdywgaClcbiAgICAgIH1cbiAgICAgIHJlc2l6ZUF0dGFjaG1lbnQoZnJhbWVidWZmZXIuZGVwdGhBdHRhY2htZW50LCB3LCBoKVxuICAgICAgcmVzaXplQXR0YWNobWVudChmcmFtZWJ1ZmZlci5zdGVuY2lsQXR0YWNobWVudCwgdywgaClcbiAgICAgIHJlc2l6ZUF0dGFjaG1lbnQoZnJhbWVidWZmZXIuZGVwdGhTdGVuY2lsQXR0YWNobWVudCwgdywgaClcblxuICAgICAgZnJhbWVidWZmZXIud2lkdGggPSByZWdsRnJhbWVidWZmZXIud2lkdGggPSB3XG4gICAgICBmcmFtZWJ1ZmZlci5oZWlnaHQgPSByZWdsRnJhbWVidWZmZXIuaGVpZ2h0ID0gaFxuXG4gICAgICB1cGRhdGVGcmFtZWJ1ZmZlcihmcmFtZWJ1ZmZlcilcblxuICAgICAgcmV0dXJuIHJlZ2xGcmFtZWJ1ZmZlclxuICAgIH1cblxuICAgIHJlZ2xGcmFtZWJ1ZmZlcihhMCwgYTEpXG5cbiAgICByZXR1cm4gZXh0ZW5kKHJlZ2xGcmFtZWJ1ZmZlciwge1xuICAgICAgcmVzaXplOiByZXNpemUsXG4gICAgICBfcmVnbFR5cGU6ICdmcmFtZWJ1ZmZlcicsXG4gICAgICBfZnJhbWVidWZmZXI6IGZyYW1lYnVmZmVyLFxuICAgICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgICBkZXN0cm95KGZyYW1lYnVmZmVyKVxuICAgICAgICBkZWNGQk9SZWZzKGZyYW1lYnVmZmVyKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVDdWJlRkJPIChvcHRpb25zKSB7XG4gICAgdmFyIGZhY2VzID0gQXJyYXkoNilcblxuICAgIGZ1bmN0aW9uIHJlZ2xGcmFtZWJ1ZmZlckN1YmUgKGEpIHtcbiAgICAgIHZhciBpXG5cbiAgICAgIFxuXG4gICAgICB2YXIgZXh0RHJhd0J1ZmZlcnMgPSBleHRlbnNpb25zLndlYmdsX2RyYXdfYnVmZmVyc1xuXG4gICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICBjb2xvcjogbnVsbFxuICAgICAgfVxuXG4gICAgICB2YXIgcmFkaXVzID0gMFxuXG4gICAgICB2YXIgY29sb3JCdWZmZXIgPSBudWxsXG4gICAgICB2YXIgY29sb3JGb3JtYXQgPSAncmdiYSdcbiAgICAgIHZhciBjb2xvclR5cGUgPSAndWludDgnXG4gICAgICB2YXIgY29sb3JDb3VudCA9IDFcblxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnbnVtYmVyJykge1xuICAgICAgICByYWRpdXMgPSBhIHwgMFxuICAgICAgfSBlbHNlIGlmICghYSkge1xuICAgICAgICByYWRpdXMgPSAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBhXG5cbiAgICAgICAgaWYgKCdzaGFwZScgaW4gb3B0aW9ucykge1xuICAgICAgICAgIHZhciBzaGFwZSA9IG9wdGlvbnMuc2hhcGVcbiAgICAgICAgICBcbiAgICAgICAgICBcbiAgICAgICAgICByYWRpdXMgPSBzaGFwZVswXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICgncmFkaXVzJyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICByYWRpdXMgPSBvcHRpb25zLnJhZGl1cyB8IDBcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCd3aWR0aCcgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgcmFkaXVzID0gb3B0aW9ucy53aWR0aCB8IDBcbiAgICAgICAgICAgIGlmICgnaGVpZ2h0JyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoJ2hlaWdodCcgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgcmFkaXVzID0gb3B0aW9ucy5oZWlnaHQgfCAwXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCdjb2xvcicgaW4gb3B0aW9ucyB8fFxuICAgICAgICAgICAgJ2NvbG9ycycgaW4gb3B0aW9ucykge1xuICAgICAgICAgIGNvbG9yQnVmZmVyID1cbiAgICAgICAgICAgIG9wdGlvbnMuY29sb3IgfHxcbiAgICAgICAgICAgIG9wdGlvbnMuY29sb3JzXG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29sb3JCdWZmZXIpKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNvbG9yQnVmZmVyKSB7XG4gICAgICAgICAgaWYgKCdjb2xvckNvdW50JyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb2xvckNvdW50ID0gb3B0aW9ucy5jb2xvckNvdW50IHwgMFxuICAgICAgICAgICAgXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCdjb2xvclR5cGUnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29sb3JUeXBlID0gb3B0aW9ucy5jb2xvclR5cGVcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoJ2NvbG9yRm9ybWF0JyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjb2xvckZvcm1hdCA9IG9wdGlvbnMuY29sb3JGb3JtYXRcbiAgICAgICAgICAgIFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgnZGVwdGgnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICBwYXJhbXMuZGVwdGggPSBvcHRpb25zLmRlcHRoXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJ3N0ZW5jaWwnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICBwYXJhbXMuc3RlbmNpbCA9IG9wdGlvbnMuc3RlbmNpbFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCdkZXB0aFN0ZW5jaWwnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICBwYXJhbXMuZGVwdGhTdGVuY2lsID0gb3B0aW9ucy5kZXB0aFN0ZW5jaWxcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgY29sb3JDdWJlc1xuICAgICAgaWYgKGNvbG9yQnVmZmVyKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbG9yQnVmZmVyKSkge1xuICAgICAgICAgIGNvbG9yQ3ViZXMgPSBbXVxuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb2xvckJ1ZmZlci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY29sb3JDdWJlc1tpXSA9IGNvbG9yQnVmZmVyW2ldXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbG9yQ3ViZXMgPSBbIGNvbG9yQnVmZmVyIF1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sb3JDdWJlcyA9IEFycmF5KGNvbG9yQ291bnQpXG4gICAgICAgIHZhciBjdWJlTWFwUGFyYW1zID0ge1xuICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgIGZvcm1hdDogY29sb3JGb3JtYXQsXG4gICAgICAgICAgdHlwZTogY29sb3JUeXBlXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbG9yQ291bnQ7ICsraSkge1xuICAgICAgICAgIGNvbG9yQ3ViZXNbaV0gPSB0ZXh0dXJlU3RhdGUuY3JlYXRlQ3ViZShjdWJlTWFwUGFyYW1zKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGNvbG9yIGN1YmVzXG4gICAgICBwYXJhbXMuY29sb3IgPSBBcnJheShjb2xvckN1YmVzLmxlbmd0aClcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjb2xvckN1YmVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBjdWJlID0gY29sb3JDdWJlc1tpXVxuICAgICAgICBcbiAgICAgICAgcmFkaXVzID0gcmFkaXVzIHx8IGN1YmUud2lkdGhcbiAgICAgICAgXG4gICAgICAgIHBhcmFtcy5jb2xvcltpXSA9IHtcbiAgICAgICAgICB0YXJnZXQ6IEdMX1RFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCxcbiAgICAgICAgICBkYXRhOiBjb2xvckN1YmVzW2ldXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IDY7ICsraSkge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvbG9yQ3ViZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICBwYXJhbXMuY29sb3Jbal0udGFyZ2V0ID0gR0xfVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgaVxuICAgICAgICB9XG4gICAgICAgIC8vIHJldXNlIGRlcHRoLXN0ZW5jaWwgYXR0YWNobWVudHMgYWNyb3NzIGFsbCBjdWJlIG1hcHNcbiAgICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgICAgcGFyYW1zLmRlcHRoID0gZmFjZXNbMF0uZGVwdGhcbiAgICAgICAgICBwYXJhbXMuc3RlbmNpbCA9IGZhY2VzWzBdLnN0ZW5jaWxcbiAgICAgICAgICBwYXJhbXMuZGVwdGhTdGVuY2lsID0gZmFjZXNbMF0uZGVwdGhTdGVuY2lsXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZhY2VzW2ldKSB7XG4gICAgICAgICAgKGZhY2VzW2ldKShwYXJhbXMpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmFjZXNbaV0gPSBjcmVhdGVGQk8ocGFyYW1zKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBleHRlbmQocmVnbEZyYW1lYnVmZmVyQ3ViZSwge1xuICAgICAgICB3aWR0aDogcmFkaXVzLFxuICAgICAgICBoZWlnaHQ6IHJhZGl1cyxcbiAgICAgICAgY29sb3I6IGNvbG9yQ3ViZXNcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzaXplIChyYWRpdXNfKSB7XG4gICAgICB2YXIgaVxuICAgICAgdmFyIHJhZGl1cyA9IHJhZGl1c18gfCAwXG4gICAgICBcblxuICAgICAgaWYgKHJhZGl1cyA9PT0gcmVnbEZyYW1lYnVmZmVyQ3ViZS53aWR0aCkge1xuICAgICAgICByZXR1cm4gcmVnbEZyYW1lYnVmZmVyQ3ViZVxuICAgICAgfVxuXG4gICAgICB2YXIgY29sb3JzID0gcmVnbEZyYW1lYnVmZmVyQ3ViZS5jb2xvclxuICAgICAgZm9yIChpID0gMDsgaSA8IGNvbG9ycy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb2xvcnNbaV0ucmVzaXplKHJhZGl1cylcbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IDY7ICsraSkge1xuICAgICAgICBmYWNlc1tpXS5yZXNpemUocmFkaXVzKVxuICAgICAgfVxuXG4gICAgICByZWdsRnJhbWVidWZmZXJDdWJlLndpZHRoID0gcmVnbEZyYW1lYnVmZmVyQ3ViZS5oZWlnaHQgPSByYWRpdXNcblxuICAgICAgcmV0dXJuIHJlZ2xGcmFtZWJ1ZmZlckN1YmVcbiAgICB9XG5cbiAgICByZWdsRnJhbWVidWZmZXJDdWJlKG9wdGlvbnMpXG5cbiAgICByZXR1cm4gZXh0ZW5kKHJlZ2xGcmFtZWJ1ZmZlckN1YmUsIHtcbiAgICAgIGZhY2VzOiBmYWNlcyxcbiAgICAgIHJlc2l6ZTogcmVzaXplLFxuICAgICAgX3JlZ2xUeXBlOiAnZnJhbWVidWZmZXJDdWJlJyxcbiAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZmFjZXMuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgICAgIGYuZGVzdHJveSgpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc3RvcmVGcmFtZWJ1ZmZlcnMgKCkge1xuICAgIHZhbHVlcyhmcmFtZWJ1ZmZlclNldCkuZm9yRWFjaChmdW5jdGlvbiAoZmIpIHtcbiAgICAgIGZiLmZyYW1lYnVmZmVyID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKVxuICAgICAgdXBkYXRlRnJhbWVidWZmZXIoZmIpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBleHRlbmQoZnJhbWVidWZmZXJTdGF0ZSwge1xuICAgIGdldEZyYW1lYnVmZmVyOiBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICBpZiAodHlwZW9mIG9iamVjdCA9PT0gJ2Z1bmN0aW9uJyAmJiBvYmplY3QuX3JlZ2xUeXBlID09PSAnZnJhbWVidWZmZXInKSB7XG4gICAgICAgIHZhciBmYm8gPSBvYmplY3QuX2ZyYW1lYnVmZmVyXG4gICAgICAgIGlmIChmYm8gaW5zdGFuY2VvZiBSRUdMRnJhbWVidWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gZmJvXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsXG4gICAgfSxcbiAgICBjcmVhdGU6IGNyZWF0ZUZCTyxcbiAgICBjcmVhdGVDdWJlOiBjcmVhdGVDdWJlRkJPLFxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YWx1ZXMoZnJhbWVidWZmZXJTZXQpLmZvckVhY2goZGVzdHJveSlcbiAgICB9LFxuICAgIHJlc3RvcmU6IHJlc3RvcmVGcmFtZWJ1ZmZlcnNcbiAgfSlcbn1cbiIsInZhciBHTF9TVUJQSVhFTF9CSVRTID0gMHgwRDUwXG52YXIgR0xfUkVEX0JJVFMgPSAweDBENTJcbnZhciBHTF9HUkVFTl9CSVRTID0gMHgwRDUzXG52YXIgR0xfQkxVRV9CSVRTID0gMHgwRDU0XG52YXIgR0xfQUxQSEFfQklUUyA9IDB4MEQ1NVxudmFyIEdMX0RFUFRIX0JJVFMgPSAweDBENTZcbnZhciBHTF9TVEVOQ0lMX0JJVFMgPSAweDBENTdcblxudmFyIEdMX0FMSUFTRURfUE9JTlRfU0laRV9SQU5HRSA9IDB4ODQ2RFxudmFyIEdMX0FMSUFTRURfTElORV9XSURUSF9SQU5HRSA9IDB4ODQ2RVxuXG52YXIgR0xfTUFYX1RFWFRVUkVfU0laRSA9IDB4MEQzM1xudmFyIEdMX01BWF9WSUVXUE9SVF9ESU1TID0gMHgwRDNBXG52YXIgR0xfTUFYX1ZFUlRFWF9BVFRSSUJTID0gMHg4ODY5XG52YXIgR0xfTUFYX1ZFUlRFWF9VTklGT1JNX1ZFQ1RPUlMgPSAweDhERkJcbnZhciBHTF9NQVhfVkFSWUlOR19WRUNUT1JTID0gMHg4REZDXG52YXIgR0xfTUFYX0NPTUJJTkVEX1RFWFRVUkVfSU1BR0VfVU5JVFMgPSAweDhCNERcbnZhciBHTF9NQVhfVkVSVEVYX1RFWFRVUkVfSU1BR0VfVU5JVFMgPSAweDhCNENcbnZhciBHTF9NQVhfVEVYVFVSRV9JTUFHRV9VTklUUyA9IDB4ODg3MlxudmFyIEdMX01BWF9GUkFHTUVOVF9VTklGT1JNX1ZFQ1RPUlMgPSAweDhERkRcbnZhciBHTF9NQVhfQ1VCRV9NQVBfVEVYVFVSRV9TSVpFID0gMHg4NTFDXG52YXIgR0xfTUFYX1JFTkRFUkJVRkZFUl9TSVpFID0gMHg4NEU4XG5cbnZhciBHTF9WRU5ET1IgPSAweDFGMDBcbnZhciBHTF9SRU5ERVJFUiA9IDB4MUYwMVxudmFyIEdMX1ZFUlNJT04gPSAweDFGMDJcbnZhciBHTF9TSEFESU5HX0xBTkdVQUdFX1ZFUlNJT04gPSAweDhCOENcblxudmFyIEdMX01BWF9URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVCA9IDB4ODRGRlxuXG52YXIgR0xfTUFYX0NPTE9SX0FUVEFDSE1FTlRTX1dFQkdMID0gMHg4Q0RGXG52YXIgR0xfTUFYX0RSQVdfQlVGRkVSU19XRUJHTCA9IDB4ODgyNFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChnbCwgZXh0ZW5zaW9ucykge1xuICB2YXIgbWF4QW5pc290cm9waWMgPSAxXG4gIGlmIChleHRlbnNpb25zLmV4dF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpYykge1xuICAgIG1heEFuaXNvdHJvcGljID0gZ2wuZ2V0UGFyYW1ldGVyKEdMX01BWF9URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVClcbiAgfVxuXG4gIHZhciBtYXhEcmF3YnVmZmVycyA9IDFcbiAgdmFyIG1heENvbG9yQXR0YWNobWVudHMgPSAxXG4gIGlmIChleHRlbnNpb25zLndlYmdsX2RyYXdfYnVmZmVycykge1xuICAgIG1heERyYXdidWZmZXJzID0gZ2wuZ2V0UGFyYW1ldGVyKEdMX01BWF9EUkFXX0JVRkZFUlNfV0VCR0wpXG4gICAgbWF4Q29sb3JBdHRhY2htZW50cyA9IGdsLmdldFBhcmFtZXRlcihHTF9NQVhfQ09MT1JfQVRUQUNITUVOVFNfV0VCR0wpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8vIGRyYXdpbmcgYnVmZmVyIGJpdCBkZXB0aFxuICAgIGNvbG9yQml0czogW1xuICAgICAgZ2wuZ2V0UGFyYW1ldGVyKEdMX1JFRF9CSVRTKSxcbiAgICAgIGdsLmdldFBhcmFtZXRlcihHTF9HUkVFTl9CSVRTKSxcbiAgICAgIGdsLmdldFBhcmFtZXRlcihHTF9CTFVFX0JJVFMpLFxuICAgICAgZ2wuZ2V0UGFyYW1ldGVyKEdMX0FMUEhBX0JJVFMpXG4gICAgXSxcbiAgICBkZXB0aEJpdHM6IGdsLmdldFBhcmFtZXRlcihHTF9ERVBUSF9CSVRTKSxcbiAgICBzdGVuY2lsQml0czogZ2wuZ2V0UGFyYW1ldGVyKEdMX1NURU5DSUxfQklUUyksXG4gICAgc3VicGl4ZWxCaXRzOiBnbC5nZXRQYXJhbWV0ZXIoR0xfU1VCUElYRUxfQklUUyksXG5cbiAgICAvLyBzdXBwb3J0ZWQgZXh0ZW5zaW9uc1xuICAgIGV4dGVuc2lvbnM6IE9iamVjdC5rZXlzKGV4dGVuc2lvbnMpLmZpbHRlcihmdW5jdGlvbiAoZXh0KSB7XG4gICAgICByZXR1cm4gISFleHRlbnNpb25zW2V4dF1cbiAgICB9KSxcblxuICAgIC8vIG1heCBhbmlzbyBzYW1wbGVzXG4gICAgbWF4QW5pc290cm9waWM6IG1heEFuaXNvdHJvcGljLFxuXG4gICAgLy8gbWF4IGRyYXcgYnVmZmVyc1xuICAgIG1heERyYXdidWZmZXJzOiBtYXhEcmF3YnVmZmVycyxcbiAgICBtYXhDb2xvckF0dGFjaG1lbnRzOiBtYXhDb2xvckF0dGFjaG1lbnRzLFxuXG4gICAgLy8gcG9pbnQgYW5kIGxpbmUgc2l6ZSByYW5nZXNcbiAgICBwb2ludFNpemVEaW1zOiBnbC5nZXRQYXJhbWV0ZXIoR0xfQUxJQVNFRF9QT0lOVF9TSVpFX1JBTkdFKSxcbiAgICBsaW5lV2lkdGhEaW1zOiBnbC5nZXRQYXJhbWV0ZXIoR0xfQUxJQVNFRF9MSU5FX1dJRFRIX1JBTkdFKSxcbiAgICBtYXhWaWV3cG9ydERpbXM6IGdsLmdldFBhcmFtZXRlcihHTF9NQVhfVklFV1BPUlRfRElNUyksXG4gICAgbWF4Q29tYmluZWRUZXh0dXJlVW5pdHM6IGdsLmdldFBhcmFtZXRlcihHTF9NQVhfQ09NQklORURfVEVYVFVSRV9JTUFHRV9VTklUUyksXG4gICAgbWF4Q3ViZU1hcFNpemU6IGdsLmdldFBhcmFtZXRlcihHTF9NQVhfQ1VCRV9NQVBfVEVYVFVSRV9TSVpFKSxcbiAgICBtYXhSZW5kZXJidWZmZXJTaXplOiBnbC5nZXRQYXJhbWV0ZXIoR0xfTUFYX1JFTkRFUkJVRkZFUl9TSVpFKSxcbiAgICBtYXhUZXh0dXJlVW5pdHM6IGdsLmdldFBhcmFtZXRlcihHTF9NQVhfVEVYVFVSRV9JTUFHRV9VTklUUyksXG4gICAgbWF4VGV4dHVyZVNpemU6IGdsLmdldFBhcmFtZXRlcihHTF9NQVhfVEVYVFVSRV9TSVpFKSxcbiAgICBtYXhBdHRyaWJ1dGVzOiBnbC5nZXRQYXJhbWV0ZXIoR0xfTUFYX1ZFUlRFWF9BVFRSSUJTKSxcbiAgICBtYXhWZXJ0ZXhVbmlmb3JtczogZ2wuZ2V0UGFyYW1ldGVyKEdMX01BWF9WRVJURVhfVU5JRk9STV9WRUNUT1JTKSxcbiAgICBtYXhWZXJ0ZXhUZXh0dXJlVW5pdHM6IGdsLmdldFBhcmFtZXRlcihHTF9NQVhfVkVSVEVYX1RFWFRVUkVfSU1BR0VfVU5JVFMpLFxuICAgIG1heFZhcnlpbmdWZWN0b3JzOiBnbC5nZXRQYXJhbWV0ZXIoR0xfTUFYX1ZBUllJTkdfVkVDVE9SUyksXG4gICAgbWF4RnJhZ21lbnRVbmlmb3JtczogZ2wuZ2V0UGFyYW1ldGVyKEdMX01BWF9GUkFHTUVOVF9VTklGT1JNX1ZFQ1RPUlMpLFxuXG4gICAgLy8gdmVuZG9yIGluZm9cbiAgICBnbHNsOiBnbC5nZXRQYXJhbWV0ZXIoR0xfU0hBRElOR19MQU5HVUFHRV9WRVJTSU9OKSxcbiAgICByZW5kZXJlcjogZ2wuZ2V0UGFyYW1ldGVyKEdMX1JFTkRFUkVSKSxcbiAgICB2ZW5kb3I6IGdsLmdldFBhcmFtZXRlcihHTF9WRU5ET1IpLFxuICAgIHZlcnNpb246IGdsLmdldFBhcmFtZXRlcihHTF9WRVJTSU9OKVxuICB9XG59XG4iLCJcbnZhciBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL3V0aWwvaXMtdHlwZWQtYXJyYXknKVxuXG52YXIgR0xfUkdCQSA9IDY0MDhcbnZhciBHTF9VTlNJR05FRF9CWVRFID0gNTEyMVxudmFyIEdMX1BBQ0tfQUxJR05NRU5UID0gMHgwRDA1XG52YXIgR0xfRkxPQVQgPSAweDE0MDYgLy8gNTEyNlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHdyYXBSZWFkUGl4ZWxzIChcbiAgZ2wsXG4gIGZyYW1lYnVmZmVyU3RhdGUsXG4gIHJlZ2xQb2xsLFxuICBjb250ZXh0LFxuICBnbEF0dHJpYnV0ZXMsXG4gIGV4dGVuc2lvbnMpIHtcbiAgZnVuY3Rpb24gcmVhZFBpeGVscyAoaW5wdXQpIHtcbiAgICB2YXIgdHlwZVxuICAgIGlmIChmcmFtZWJ1ZmZlclN0YXRlLm5leHQgPT09IG51bGwpIHtcbiAgICAgIFxuICAgICAgdHlwZSA9IEdMX1VOU0lHTkVEX0JZVEVcbiAgICB9IGVsc2Uge1xuICAgICAgXG4gICAgICB0eXBlID0gZnJhbWVidWZmZXJTdGF0ZS5uZXh0LmNvbG9yQXR0YWNobWVudHNbMF0udGV4dHVyZS5fdGV4dHVyZS50eXBlXG5cbiAgICAgIGlmIChleHRlbnNpb25zLm9lc190ZXh0dXJlX2Zsb2F0KSB7XG4gICAgICAgIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgXG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHggPSAwXG4gICAgdmFyIHkgPSAwXG4gICAgdmFyIHdpZHRoID0gY29udGV4dC5mcmFtZWJ1ZmZlcldpZHRoXG4gICAgdmFyIGhlaWdodCA9IGNvbnRleHQuZnJhbWVidWZmZXJIZWlnaHRcbiAgICB2YXIgZGF0YSA9IG51bGxcblxuICAgIGlmIChpc1R5cGVkQXJyYXkoaW5wdXQpKSB7XG4gICAgICBkYXRhID0gaW5wdXRcbiAgICB9IGVsc2UgaWYgKGlucHV0KSB7XG4gICAgICBcbiAgICAgIHggPSBpbnB1dC54IHwgMFxuICAgICAgeSA9IGlucHV0LnkgfCAwXG4gICAgICBcbiAgICAgIFxuICAgICAgd2lkdGggPSAoaW5wdXQud2lkdGggfHwgKGNvbnRleHQuZnJhbWVidWZmZXJXaWR0aCAtIHgpKSB8IDBcbiAgICAgIGhlaWdodCA9IChpbnB1dC5oZWlnaHQgfHwgKGNvbnRleHQuZnJhbWVidWZmZXJIZWlnaHQgLSB5KSkgfCAwXG4gICAgICBkYXRhID0gaW5wdXQuZGF0YSB8fCBudWxsXG4gICAgfVxuXG4gICAgLy8gc2FuaXR5IGNoZWNrIGlucHV0LmRhdGFcbiAgICBpZiAoZGF0YSkge1xuICAgICAgaWYgKHR5cGUgPT09IEdMX1VOU0lHTkVEX0JZVEUpIHtcbiAgICAgICAgXG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IEdMX0ZMT0FUKSB7XG4gICAgICAgIFxuICAgICAgfVxuICAgIH1cblxuICAgIFxuICAgIFxuXG4gICAgLy8gVXBkYXRlIFdlYkdMIHN0YXRlXG4gICAgcmVnbFBvbGwoKVxuXG4gICAgLy8gQ29tcHV0ZSBzaXplXG4gICAgdmFyIHNpemUgPSB3aWR0aCAqIGhlaWdodCAqIDRcblxuICAgIC8vIEFsbG9jYXRlIGRhdGFcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIGlmICh0eXBlID09PSBHTF9VTlNJR05FRF9CWVRFKSB7XG4gICAgICAgIGRhdGEgPSBuZXcgVWludDhBcnJheShzaXplKVxuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBHTF9GTE9BVCkge1xuICAgICAgICBkYXRhID0gZGF0YSB8fCBuZXcgRmxvYXQzMkFycmF5KHNpemUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVHlwZSBjaGVja1xuICAgIFxuICAgIFxuXG4gICAgLy8gUnVuIHJlYWQgcGl4ZWxzXG4gICAgZ2wucGl4ZWxTdG9yZWkoR0xfUEFDS19BTElHTk1FTlQsIDQpXG4gICAgZ2wucmVhZFBpeGVscyh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBHTF9SR0JBLFxuICAgICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICAgIGRhdGEpXG5cbiAgICByZXR1cm4gZGF0YVxuICB9XG5cbiAgcmV0dXJuIHJlYWRQaXhlbHNcbn1cbiIsIlxudmFyIHZhbHVlcyA9IHJlcXVpcmUoJy4vdXRpbC92YWx1ZXMnKVxuXG52YXIgR0xfUkVOREVSQlVGRkVSID0gMHg4RDQxXG5cbnZhciBHTF9SR0JBNCA9IDB4ODA1NlxudmFyIEdMX1JHQjVfQTEgPSAweDgwNTdcbnZhciBHTF9SR0I1NjUgPSAweDhENjJcbnZhciBHTF9ERVBUSF9DT01QT05FTlQxNiA9IDB4ODFBNVxudmFyIEdMX1NURU5DSUxfSU5ERVg4ID0gMHg4RDQ4XG52YXIgR0xfREVQVEhfU1RFTkNJTCA9IDB4ODRGOVxuXG52YXIgR0xfU1JHQjhfQUxQSEE4X0VYVCA9IDB4OEM0M1xuXG52YXIgR0xfUkdCQTMyRl9FWFQgPSAweDg4MTRcblxudmFyIEdMX1JHQkExNkZfRVhUID0gMHg4ODFBXG52YXIgR0xfUkdCMTZGX0VYVCA9IDB4ODgxQlxuXG52YXIgRk9STUFUX1NJWkVTID0gW11cblxuRk9STUFUX1NJWkVTW0dMX1JHQkE0XSA9IDJcbkZPUk1BVF9TSVpFU1tHTF9SR0I1X0ExXSA9IDJcbkZPUk1BVF9TSVpFU1tHTF9SR0I1NjVdID0gMlxuXG5GT1JNQVRfU0laRVNbR0xfREVQVEhfQ09NUE9ORU5UMTZdID0gMlxuRk9STUFUX1NJWkVTW0dMX1NURU5DSUxfSU5ERVg4XSA9IDFcbkZPUk1BVF9TSVpFU1tHTF9ERVBUSF9TVEVOQ0lMXSA9IDRcblxuRk9STUFUX1NJWkVTW0dMX1NSR0I4X0FMUEhBOF9FWFRdID0gNFxuRk9STUFUX1NJWkVTW0dMX1JHQkEzMkZfRVhUXSA9IDE2XG5GT1JNQVRfU0laRVNbR0xfUkdCQTE2Rl9FWFRdID0gOFxuRk9STUFUX1NJWkVTW0dMX1JHQjE2Rl9FWFRdID0gNlxuXG5mdW5jdGlvbiBnZXRSZW5kZXJidWZmZXJTaXplIChmb3JtYXQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgcmV0dXJuIEZPUk1BVF9TSVpFU1tmb3JtYXRdICogd2lkdGggKiBoZWlnaHRcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZ2wsIGV4dGVuc2lvbnMsIGxpbWl0cywgc3RhdHMsIGNvbmZpZykge1xuICB2YXIgZm9ybWF0VHlwZXMgPSB7XG4gICAgJ3JnYmE0JzogR0xfUkdCQTQsXG4gICAgJ3JnYjU2NSc6IEdMX1JHQjU2NSxcbiAgICAncmdiNSBhMSc6IEdMX1JHQjVfQTEsXG4gICAgJ2RlcHRoJzogR0xfREVQVEhfQ09NUE9ORU5UMTYsXG4gICAgJ3N0ZW5jaWwnOiBHTF9TVEVOQ0lMX0lOREVYOCxcbiAgICAnZGVwdGggc3RlbmNpbCc6IEdMX0RFUFRIX1NURU5DSUxcbiAgfVxuXG4gIGlmIChleHRlbnNpb25zLmV4dF9zcmdiKSB7XG4gICAgZm9ybWF0VHlwZXNbJ3NyZ2JhJ10gPSBHTF9TUkdCOF9BTFBIQThfRVhUXG4gIH1cblxuICBpZiAoZXh0ZW5zaW9ucy5leHRfY29sb3JfYnVmZmVyX2hhbGZfZmxvYXQpIHtcbiAgICBmb3JtYXRUeXBlc1sncmdiYTE2ZiddID0gR0xfUkdCQTE2Rl9FWFRcbiAgICBmb3JtYXRUeXBlc1sncmdiMTZmJ10gPSBHTF9SR0IxNkZfRVhUXG4gIH1cblxuICBpZiAoZXh0ZW5zaW9ucy53ZWJnbF9jb2xvcl9idWZmZXJfZmxvYXQpIHtcbiAgICBmb3JtYXRUeXBlc1sncmdiYTMyZiddID0gR0xfUkdCQTMyRl9FWFRcbiAgfVxuXG4gIHZhciByZW5kZXJidWZmZXJDb3VudCA9IDBcbiAgdmFyIHJlbmRlcmJ1ZmZlclNldCA9IHt9XG5cbiAgZnVuY3Rpb24gUkVHTFJlbmRlcmJ1ZmZlciAocmVuZGVyYnVmZmVyKSB7XG4gICAgdGhpcy5pZCA9IHJlbmRlcmJ1ZmZlckNvdW50KytcbiAgICB0aGlzLnJlZkNvdW50ID0gMVxuXG4gICAgdGhpcy5yZW5kZXJidWZmZXIgPSByZW5kZXJidWZmZXJcblxuICAgIHRoaXMuZm9ybWF0ID0gR0xfUkdCQTRcbiAgICB0aGlzLndpZHRoID0gMFxuICAgIHRoaXMuaGVpZ2h0ID0gMFxuXG4gICAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgICB0aGlzLnN0YXRzID0ge3NpemU6IDB9XG4gICAgfVxuICB9XG5cbiAgUkVHTFJlbmRlcmJ1ZmZlci5wcm90b3R5cGUuZGVjUmVmID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICgtLXRoaXMucmVmQ291bnQgPD0gMCkge1xuICAgICAgZGVzdHJveSh0aGlzKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRlc3Ryb3kgKHJiKSB7XG4gICAgdmFyIGhhbmRsZSA9IHJiLnJlbmRlcmJ1ZmZlclxuICAgIFxuICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoR0xfUkVOREVSQlVGRkVSLCBudWxsKVxuICAgIGdsLmRlbGV0ZVJlbmRlcmJ1ZmZlcihoYW5kbGUpXG4gICAgcmIucmVuZGVyYnVmZmVyID0gbnVsbFxuICAgIHJiLnJlZkNvdW50ID0gMFxuICAgIGRlbGV0ZSByZW5kZXJidWZmZXJTZXRbcmIuaWRdXG4gICAgc3RhdHMucmVuZGVyYnVmZmVyQ291bnQtLVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUmVuZGVyYnVmZmVyIChhLCBiKSB7XG4gICAgdmFyIHJlbmRlcmJ1ZmZlciA9IG5ldyBSRUdMUmVuZGVyYnVmZmVyKGdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpKVxuICAgIHJlbmRlcmJ1ZmZlclNldFtyZW5kZXJidWZmZXIuaWRdID0gcmVuZGVyYnVmZmVyXG4gICAgc3RhdHMucmVuZGVyYnVmZmVyQ291bnQrK1xuXG4gICAgZnVuY3Rpb24gcmVnbFJlbmRlcmJ1ZmZlciAoYSwgYikge1xuICAgICAgdmFyIHcgPSAwXG4gICAgICB2YXIgaCA9IDBcbiAgICAgIHZhciBmb3JtYXQgPSBHTF9SR0JBNFxuXG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnICYmIGEpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBhXG4gICAgICAgIGlmICgnc2hhcGUnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICB2YXIgc2hhcGUgPSBvcHRpb25zLnNoYXBlXG4gICAgICAgICAgXG4gICAgICAgICAgdyA9IHNoYXBlWzBdIHwgMFxuICAgICAgICAgIGggPSBzaGFwZVsxXSB8IDBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoJ3JhZGl1cycgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgdyA9IGggPSBvcHRpb25zLnJhZGl1cyB8IDBcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCd3aWR0aCcgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgdyA9IG9wdGlvbnMud2lkdGggfCAwXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgnaGVpZ2h0JyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBoID0gb3B0aW9ucy5oZWlnaHQgfCAwXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICgnZm9ybWF0JyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgXG4gICAgICAgICAgZm9ybWF0ID0gZm9ybWF0VHlwZXNbb3B0aW9ucy5mb3JtYXRdXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGEgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHcgPSBhIHwgMFxuICAgICAgICBpZiAodHlwZW9mIGIgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgaCA9IGIgfCAwXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaCA9IHdcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghYSkge1xuICAgICAgICB3ID0gaCA9IDFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFxuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBzaGFwZVxuICAgICAgXG5cbiAgICAgIGlmICh3ID09PSByZW5kZXJidWZmZXIud2lkdGggJiZcbiAgICAgICAgICBoID09PSByZW5kZXJidWZmZXIuaGVpZ2h0ICYmXG4gICAgICAgICAgZm9ybWF0ID09PSByZW5kZXJidWZmZXIuZm9ybWF0KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICByZWdsUmVuZGVyYnVmZmVyLndpZHRoID0gcmVuZGVyYnVmZmVyLndpZHRoID0gd1xuICAgICAgcmVnbFJlbmRlcmJ1ZmZlci5oZWlnaHQgPSByZW5kZXJidWZmZXIuaGVpZ2h0ID0gaFxuICAgICAgcmVuZGVyYnVmZmVyLmZvcm1hdCA9IGZvcm1hdFxuXG4gICAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKEdMX1JFTkRFUkJVRkZFUiwgcmVuZGVyYnVmZmVyLnJlbmRlcmJ1ZmZlcilcbiAgICAgIGdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UoR0xfUkVOREVSQlVGRkVSLCBmb3JtYXQsIHcsIGgpXG5cbiAgICAgIGlmIChjb25maWcucHJvZmlsZSkge1xuICAgICAgICByZW5kZXJidWZmZXIuc3RhdHMuc2l6ZSA9IGdldFJlbmRlcmJ1ZmZlclNpemUocmVuZGVyYnVmZmVyLmZvcm1hdCwgcmVuZGVyYnVmZmVyLndpZHRoLCByZW5kZXJidWZmZXIuaGVpZ2h0KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVnbFJlbmRlcmJ1ZmZlclxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2l6ZSAod18sIGhfKSB7XG4gICAgICB2YXIgdyA9IHdfIHwgMFxuICAgICAgdmFyIGggPSAoaF8gfCAwKSB8fCB3XG5cbiAgICAgIGlmICh3ID09PSByZW5kZXJidWZmZXIud2lkdGggJiYgaCA9PT0gcmVuZGVyYnVmZmVyLmhlaWdodCkge1xuICAgICAgICByZXR1cm4gcmVnbFJlbmRlcmJ1ZmZlclxuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBzaGFwZVxuICAgICAgXG5cbiAgICAgIHJlZ2xSZW5kZXJidWZmZXIud2lkdGggPSByZW5kZXJidWZmZXIud2lkdGggPSB3XG4gICAgICByZWdsUmVuZGVyYnVmZmVyLmhlaWdodCA9IHJlbmRlcmJ1ZmZlci5oZWlnaHQgPSBoXG5cbiAgICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoR0xfUkVOREVSQlVGRkVSLCByZW5kZXJidWZmZXIucmVuZGVyYnVmZmVyKVxuICAgICAgZ2wucmVuZGVyYnVmZmVyU3RvcmFnZShHTF9SRU5ERVJCVUZGRVIsIHJlbmRlcmJ1ZmZlci5mb3JtYXQsIHcsIGgpXG5cbiAgICAgIC8vIGFsc28sIHJlY29tcHV0ZSBzaXplLlxuICAgICAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgICAgIHJlbmRlcmJ1ZmZlci5zdGF0cy5zaXplID0gZ2V0UmVuZGVyYnVmZmVyU2l6ZShcbiAgICAgICAgICByZW5kZXJidWZmZXIuZm9ybWF0LCByZW5kZXJidWZmZXIud2lkdGgsIHJlbmRlcmJ1ZmZlci5oZWlnaHQpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZWdsUmVuZGVyYnVmZmVyXG4gICAgfVxuXG4gICAgcmVnbFJlbmRlcmJ1ZmZlcihhLCBiKVxuXG4gICAgcmVnbFJlbmRlcmJ1ZmZlci5yZXNpemUgPSByZXNpemVcbiAgICByZWdsUmVuZGVyYnVmZmVyLl9yZWdsVHlwZSA9ICdyZW5kZXJidWZmZXInXG4gICAgcmVnbFJlbmRlcmJ1ZmZlci5fcmVuZGVyYnVmZmVyID0gcmVuZGVyYnVmZmVyXG4gICAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgICByZWdsUmVuZGVyYnVmZmVyLnN0YXRzID0gcmVuZGVyYnVmZmVyLnN0YXRzXG4gICAgfVxuICAgIHJlZ2xSZW5kZXJidWZmZXIuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlbmRlcmJ1ZmZlci5kZWNSZWYoKVxuICAgIH1cblxuICAgIHJldHVybiByZWdsUmVuZGVyYnVmZmVyXG4gIH1cblxuICBpZiAoY29uZmlnLnByb2ZpbGUpIHtcbiAgICBzdGF0cy5nZXRUb3RhbFJlbmRlcmJ1ZmZlclNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdG90YWwgPSAwXG4gICAgICBPYmplY3Qua2V5cyhyZW5kZXJidWZmZXJTZXQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB0b3RhbCArPSByZW5kZXJidWZmZXJTZXRba2V5XS5zdGF0cy5zaXplXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHRvdGFsXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzdG9yZVJlbmRlcmJ1ZmZlcnMgKCkge1xuICAgIHZhbHVlcyhyZW5kZXJidWZmZXJTZXQpLmZvckVhY2goZnVuY3Rpb24gKHJiKSB7XG4gICAgICByYi5yZW5kZXJidWZmZXIgPSBnbC5jcmVhdGVSZW5kZXJidWZmZXIoKVxuICAgICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihHTF9SRU5ERVJCVUZGRVIsIHJiLnJlbmRlcmJ1ZmZlcilcbiAgICAgIGdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UoR0xfUkVOREVSQlVGRkVSLCByYi5mb3JtYXQsIHJiLndpZHRoLCByYi5oZWlnaHQpXG4gICAgfSlcbiAgICBnbC5iaW5kUmVuZGVyYnVmZmVyKEdMX1JFTkRFUkJVRkZFUiwgbnVsbClcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY3JlYXRlOiBjcmVhdGVSZW5kZXJidWZmZXIsXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhbHVlcyhyZW5kZXJidWZmZXJTZXQpLmZvckVhY2goZGVzdHJveSlcbiAgICB9LFxuICAgIHJlc3RvcmU6IHJlc3RvcmVSZW5kZXJidWZmZXJzXG4gIH1cbn1cbiIsIlxudmFyIHZhbHVlcyA9IHJlcXVpcmUoJy4vdXRpbC92YWx1ZXMnKVxuXG52YXIgR0xfRlJBR01FTlRfU0hBREVSID0gMzU2MzJcbnZhciBHTF9WRVJURVhfU0hBREVSID0gMzU2MzNcblxudmFyIEdMX0FDVElWRV9VTklGT1JNUyA9IDB4OEI4NlxudmFyIEdMX0FDVElWRV9BVFRSSUJVVEVTID0gMHg4Qjg5XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gd3JhcFNoYWRlclN0YXRlIChnbCwgc3RyaW5nU3RvcmUsIHN0YXRzLCBjb25maWcpIHtcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIGdsc2wgY29tcGlsYXRpb24gYW5kIGxpbmtpbmdcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIHZhciBmcmFnU2hhZGVycyA9IHt9XG4gIHZhciB2ZXJ0U2hhZGVycyA9IHt9XG5cbiAgZnVuY3Rpb24gQWN0aXZlSW5mbyAobmFtZSwgaWQsIGxvY2F0aW9uLCBpbmZvKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuaWQgPSBpZFxuICAgIHRoaXMubG9jYXRpb24gPSBsb2NhdGlvblxuICAgIHRoaXMuaW5mbyA9IGluZm9cbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2VydEFjdGl2ZUluZm8gKGxpc3QsIGluZm8pIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChsaXN0W2ldLmlkID09PSBpbmZvLmlkKSB7XG4gICAgICAgIGxpc3RbaV0ubG9jYXRpb24gPSBpbmZvLmxvY2F0aW9uXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cbiAgICBsaXN0LnB1c2goaW5mbylcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFNoYWRlciAodHlwZSwgaWQsIGNvbW1hbmQpIHtcbiAgICB2YXIgY2FjaGUgPSB0eXBlID09PSBHTF9GUkFHTUVOVF9TSEFERVIgPyBmcmFnU2hhZGVycyA6IHZlcnRTaGFkZXJzXG4gICAgdmFyIHNoYWRlciA9IGNhY2hlW2lkXVxuXG4gICAgaWYgKCFzaGFkZXIpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBzdHJpbmdTdG9yZS5zdHIoaWQpXG4gICAgICBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSlcbiAgICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSlcbiAgICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKVxuICAgICAgXG4gICAgICBjYWNoZVtpZF0gPSBzaGFkZXJcbiAgICB9XG5cbiAgICByZXR1cm4gc2hhZGVyXG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gcHJvZ3JhbSBsaW5raW5nXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICB2YXIgcHJvZ3JhbUNhY2hlID0ge31cbiAgdmFyIHByb2dyYW1MaXN0ID0gW11cblxuICB2YXIgUFJPR1JBTV9DT1VOVEVSID0gMFxuXG4gIGZ1bmN0aW9uIFJFR0xQcm9ncmFtIChmcmFnSWQsIHZlcnRJZCkge1xuICAgIHRoaXMuaWQgPSBQUk9HUkFNX0NPVU5URVIrK1xuICAgIHRoaXMuZnJhZ0lkID0gZnJhZ0lkXG4gICAgdGhpcy52ZXJ0SWQgPSB2ZXJ0SWRcbiAgICB0aGlzLnByb2dyYW0gPSBudWxsXG4gICAgdGhpcy51bmlmb3JtcyA9IFtdXG4gICAgdGhpcy5hdHRyaWJ1dGVzID0gW11cblxuICAgIGlmIChjb25maWcucHJvZmlsZSkge1xuICAgICAgdGhpcy5zdGF0cyA9IHtcbiAgICAgICAgdW5pZm9ybXNDb3VudDogMCxcbiAgICAgICAgYXR0cmlidXRlc0NvdW50OiAwXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbGlua1Byb2dyYW0gKGRlc2MsIGNvbW1hbmQpIHtcbiAgICB2YXIgaSwgaW5mb1xuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIGNvbXBpbGUgJiBsaW5rXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHZhciBmcmFnU2hhZGVyID0gZ2V0U2hhZGVyKEdMX0ZSQUdNRU5UX1NIQURFUiwgZGVzYy5mcmFnSWQpXG4gICAgdmFyIHZlcnRTaGFkZXIgPSBnZXRTaGFkZXIoR0xfVkVSVEVYX1NIQURFUiwgZGVzYy52ZXJ0SWQpXG5cbiAgICB2YXIgcHJvZ3JhbSA9IGRlc2MucHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKVxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnU2hhZGVyKVxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0U2hhZGVyKVxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pXG4gICAgXG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gZ3JhYiB1bmlmb3Jtc1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICB2YXIgbnVtVW5pZm9ybXMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIEdMX0FDVElWRV9VTklGT1JNUylcbiAgICBpZiAoY29uZmlnLnByb2ZpbGUpIHtcbiAgICAgIGRlc2Muc3RhdHMudW5pZm9ybXNDb3VudCA9IG51bVVuaWZvcm1zXG4gICAgfVxuICAgIHZhciB1bmlmb3JtcyA9IGRlc2MudW5pZm9ybXNcbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtVW5pZm9ybXM7ICsraSkge1xuICAgICAgaW5mbyA9IGdsLmdldEFjdGl2ZVVuaWZvcm0ocHJvZ3JhbSwgaSlcbiAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgIGlmIChpbmZvLnNpemUgPiAxKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBpbmZvLnNpemU7ICsraikge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSBpbmZvLm5hbWUucmVwbGFjZSgnWzBdJywgJ1snICsgaiArICddJylcbiAgICAgICAgICAgIGluc2VydEFjdGl2ZUluZm8odW5pZm9ybXMsIG5ldyBBY3RpdmVJbmZvKFxuICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICBzdHJpbmdTdG9yZS5pZChuYW1lKSxcbiAgICAgICAgICAgICAgZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIG5hbWUpLFxuICAgICAgICAgICAgICBpbmZvKSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5zZXJ0QWN0aXZlSW5mbyh1bmlmb3JtcywgbmV3IEFjdGl2ZUluZm8oXG4gICAgICAgICAgICBpbmZvLm5hbWUsXG4gICAgICAgICAgICBzdHJpbmdTdG9yZS5pZChpbmZvLm5hbWUpLFxuICAgICAgICAgICAgZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIGluZm8ubmFtZSksXG4gICAgICAgICAgICBpbmZvKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBncmFiIGF0dHJpYnV0ZXNcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgdmFyIG51bUF0dHJpYnV0ZXMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIEdMX0FDVElWRV9BVFRSSUJVVEVTKVxuICAgIGlmIChjb25maWcucHJvZmlsZSkge1xuICAgICAgZGVzYy5zdGF0cy5hdHRyaWJ1dGVzQ291bnQgPSBudW1BdHRyaWJ1dGVzXG4gICAgfVxuXG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBkZXNjLmF0dHJpYnV0ZXNcbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtQXR0cmlidXRlczsgKytpKSB7XG4gICAgICBpbmZvID0gZ2wuZ2V0QWN0aXZlQXR0cmliKHByb2dyYW0sIGkpXG4gICAgICBpZiAoaW5mbykge1xuICAgICAgICBpbnNlcnRBY3RpdmVJbmZvKGF0dHJpYnV0ZXMsIG5ldyBBY3RpdmVJbmZvKFxuICAgICAgICAgIGluZm8ubmFtZSxcbiAgICAgICAgICBzdHJpbmdTdG9yZS5pZChpbmZvLm5hbWUpLFxuICAgICAgICAgIGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIGluZm8ubmFtZSksXG4gICAgICAgICAgaW5mbykpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgc3RhdHMuZ2V0TWF4VW5pZm9ybXNDb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtID0gMFxuICAgICAgcHJvZ3JhbUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGVzYykge1xuICAgICAgICBpZiAoZGVzYy5zdGF0cy51bmlmb3Jtc0NvdW50ID4gbSkge1xuICAgICAgICAgIG0gPSBkZXNjLnN0YXRzLnVuaWZvcm1zQ291bnRcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVybiBtXG4gICAgfVxuXG4gICAgc3RhdHMuZ2V0TWF4QXR0cmlidXRlc0NvdW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG0gPSAwXG4gICAgICBwcm9ncmFtTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkZXNjKSB7XG4gICAgICAgIGlmIChkZXNjLnN0YXRzLmF0dHJpYnV0ZXNDb3VudCA+IG0pIHtcbiAgICAgICAgICBtID0gZGVzYy5zdGF0cy5hdHRyaWJ1dGVzQ291bnRcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHJldHVybiBtXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzdG9yZVNoYWRlcnMgKCkge1xuICAgIGZyYWdTaGFkZXJzID0ge31cbiAgICB2ZXJ0U2hhZGVycyA9IHt9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9ncmFtTGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGlua1Byb2dyYW0ocHJvZ3JhbUxpc3RbaV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRlbGV0ZVNoYWRlciA9IGdsLmRlbGV0ZVNoYWRlci5iaW5kKGdsKVxuICAgICAgdmFsdWVzKGZyYWdTaGFkZXJzKS5mb3JFYWNoKGRlbGV0ZVNoYWRlcilcbiAgICAgIGZyYWdTaGFkZXJzID0ge31cbiAgICAgIHZhbHVlcyh2ZXJ0U2hhZGVycykuZm9yRWFjaChkZWxldGVTaGFkZXIpXG4gICAgICB2ZXJ0U2hhZGVycyA9IHt9XG5cbiAgICAgIHByb2dyYW1MaXN0LmZvckVhY2goZnVuY3Rpb24gKGRlc2MpIHtcbiAgICAgICAgZ2wuZGVsZXRlUHJvZ3JhbShkZXNjLnByb2dyYW0pXG4gICAgICB9KVxuICAgICAgcHJvZ3JhbUxpc3QubGVuZ3RoID0gMFxuICAgICAgcHJvZ3JhbUNhY2hlID0ge31cblxuICAgICAgc3RhdHMuc2hhZGVyQ291bnQgPSAwXG4gICAgfSxcblxuICAgIHByb2dyYW06IGZ1bmN0aW9uICh2ZXJ0SWQsIGZyYWdJZCwgY29tbWFuZCkge1xuICAgICAgXG4gICAgICBcblxuICAgICAgc3RhdHMuc2hhZGVyQ291bnQrK1xuXG4gICAgICB2YXIgY2FjaGUgPSBwcm9ncmFtQ2FjaGVbZnJhZ0lkXVxuICAgICAgaWYgKCFjYWNoZSkge1xuICAgICAgICBjYWNoZSA9IHByb2dyYW1DYWNoZVtmcmFnSWRdID0ge31cbiAgICAgIH1cbiAgICAgIHZhciBwcm9ncmFtID0gY2FjaGVbdmVydElkXVxuICAgICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICAgIHByb2dyYW0gPSBuZXcgUkVHTFByb2dyYW0oZnJhZ0lkLCB2ZXJ0SWQpXG4gICAgICAgIGxpbmtQcm9ncmFtKHByb2dyYW0sIGNvbW1hbmQpXG4gICAgICAgIGNhY2hlW3ZlcnRJZF0gPSBwcm9ncmFtXG4gICAgICAgIHByb2dyYW1MaXN0LnB1c2gocHJvZ3JhbSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9ncmFtXG4gICAgfSxcblxuICAgIHJlc3RvcmU6IHJlc3RvcmVTaGFkZXJzLFxuXG4gICAgc2hhZGVyOiBnZXRTaGFkZXIsXG5cbiAgICBmcmFnOiAtMSxcbiAgICB2ZXJ0OiAtMVxuICB9XG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RhdHMgKCkge1xuICByZXR1cm4ge1xuICAgIGJ1ZmZlckNvdW50OiAwLFxuICAgIGVsZW1lbnRzQ291bnQ6IDAsXG4gICAgZnJhbWVidWZmZXJDb3VudDogMCxcbiAgICBzaGFkZXJDb3VudDogMCxcbiAgICB0ZXh0dXJlQ291bnQ6IDAsXG4gICAgY3ViZUNvdW50OiAwLFxuICAgIHJlbmRlcmJ1ZmZlckNvdW50OiAwLFxuXG4gICAgbWF4VGV4dHVyZVVuaXRzOiAwXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlU3RyaW5nU3RvcmUgKCkge1xuICB2YXIgc3RyaW5nSWRzID0geycnOiAwfVxuICB2YXIgc3RyaW5nVmFsdWVzID0gWycnXVxuICByZXR1cm4ge1xuICAgIGlkOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gc3RyaW5nSWRzW3N0cl1cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgfVxuICAgICAgcmVzdWx0ID0gc3RyaW5nSWRzW3N0cl0gPSBzdHJpbmdWYWx1ZXMubGVuZ3RoXG4gICAgICBzdHJpbmdWYWx1ZXMucHVzaChzdHIpXG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSxcblxuICAgIHN0cjogZnVuY3Rpb24gKGlkKSB7XG4gICAgICByZXR1cm4gc3RyaW5nVmFsdWVzW2lkXVxuICAgIH1cbiAgfVxufVxuIiwiXG52YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi91dGlsL2V4dGVuZCcpXG52YXIgdmFsdWVzID0gcmVxdWlyZSgnLi91dGlsL3ZhbHVlcycpXG52YXIgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi91dGlsL2lzLXR5cGVkLWFycmF5JylcbnZhciBpc05EQXJyYXlMaWtlID0gcmVxdWlyZSgnLi91dGlsL2lzLW5kYXJyYXknKVxudmFyIHBvb2wgPSByZXF1aXJlKCcuL3V0aWwvcG9vbCcpXG52YXIgY29udmVydFRvSGFsZkZsb2F0ID0gcmVxdWlyZSgnLi91dGlsL3RvLWhhbGYtZmxvYXQnKVxudmFyIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi91dGlsL2lzLWFycmF5LWxpa2UnKVxuXG52YXIgZHR5cGVzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvYXJyYXl0eXBlcy5qc29uJylcbnZhciBhcnJheVR5cGVzID0gcmVxdWlyZSgnLi9jb25zdGFudHMvYXJyYXl0eXBlcy5qc29uJylcblxudmFyIEdMX0NPTVBSRVNTRURfVEVYVFVSRV9GT1JNQVRTID0gMHg4NkEzXG5cbnZhciBHTF9URVhUVVJFXzJEID0gMHgwREUxXG52YXIgR0xfVEVYVFVSRV9DVUJFX01BUCA9IDB4ODUxM1xudmFyIEdMX1RFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCA9IDB4ODUxNVxuXG52YXIgR0xfUkdCQSA9IDB4MTkwOFxudmFyIEdMX0FMUEhBID0gMHgxOTA2XG52YXIgR0xfUkdCID0gMHgxOTA3XG52YXIgR0xfTFVNSU5BTkNFID0gMHgxOTA5XG52YXIgR0xfTFVNSU5BTkNFX0FMUEhBID0gMHgxOTBBXG5cbnZhciBHTF9SR0JBNCA9IDB4ODA1NlxudmFyIEdMX1JHQjVfQTEgPSAweDgwNTdcbnZhciBHTF9SR0I1NjUgPSAweDhENjJcblxudmFyIEdMX1VOU0lHTkVEX1NIT1JUXzRfNF80XzQgPSAweDgwMzNcbnZhciBHTF9VTlNJR05FRF9TSE9SVF81XzVfNV8xID0gMHg4MDM0XG52YXIgR0xfVU5TSUdORURfU0hPUlRfNV82XzUgPSAweDgzNjNcbnZhciBHTF9VTlNJR05FRF9JTlRfMjRfOF9XRUJHTCA9IDB4ODRGQVxuXG52YXIgR0xfREVQVEhfQ09NUE9ORU5UID0gMHgxOTAyXG52YXIgR0xfREVQVEhfU1RFTkNJTCA9IDB4ODRGOVxuXG52YXIgR0xfU1JHQl9FWFQgPSAweDhDNDBcbnZhciBHTF9TUkdCX0FMUEhBX0VYVCA9IDB4OEM0MlxuXG52YXIgR0xfSEFMRl9GTE9BVF9PRVMgPSAweDhENjFcblxudmFyIEdMX0NPTVBSRVNTRURfUkdCX1MzVENfRFhUMV9FWFQgPSAweDgzRjBcbnZhciBHTF9DT01QUkVTU0VEX1JHQkFfUzNUQ19EWFQxX0VYVCA9IDB4ODNGMVxudmFyIEdMX0NPTVBSRVNTRURfUkdCQV9TM1RDX0RYVDNfRVhUID0gMHg4M0YyXG52YXIgR0xfQ09NUFJFU1NFRF9SR0JBX1MzVENfRFhUNV9FWFQgPSAweDgzRjNcblxudmFyIEdMX0NPTVBSRVNTRURfUkdCX0FUQ19XRUJHTCA9IDB4OEM5MlxudmFyIEdMX0NPTVBSRVNTRURfUkdCQV9BVENfRVhQTElDSVRfQUxQSEFfV0VCR0wgPSAweDhDOTNcbnZhciBHTF9DT01QUkVTU0VEX1JHQkFfQVRDX0lOVEVSUE9MQVRFRF9BTFBIQV9XRUJHTCA9IDB4ODdFRVxuXG52YXIgR0xfQ09NUFJFU1NFRF9SR0JfUFZSVENfNEJQUFYxX0lNRyA9IDB4OEMwMFxudmFyIEdMX0NPTVBSRVNTRURfUkdCX1BWUlRDXzJCUFBWMV9JTUcgPSAweDhDMDFcbnZhciBHTF9DT01QUkVTU0VEX1JHQkFfUFZSVENfNEJQUFYxX0lNRyA9IDB4OEMwMlxudmFyIEdMX0NPTVBSRVNTRURfUkdCQV9QVlJUQ18yQlBQVjFfSU1HID0gMHg4QzAzXG5cbnZhciBHTF9DT01QUkVTU0VEX1JHQl9FVEMxX1dFQkdMID0gMHg4RDY0XG5cbnZhciBHTF9VTlNJR05FRF9CWVRFID0gMHgxNDAxXG52YXIgR0xfVU5TSUdORURfU0hPUlQgPSAweDE0MDNcbnZhciBHTF9VTlNJR05FRF9JTlQgPSAweDE0MDVcbnZhciBHTF9GTE9BVCA9IDB4MTQwNlxuXG52YXIgR0xfVEVYVFVSRV9XUkFQX1MgPSAweDI4MDJcbnZhciBHTF9URVhUVVJFX1dSQVBfVCA9IDB4MjgwM1xuXG52YXIgR0xfUkVQRUFUID0gMHgyOTAxXG52YXIgR0xfQ0xBTVBfVE9fRURHRSA9IDB4ODEyRlxudmFyIEdMX01JUlJPUkVEX1JFUEVBVCA9IDB4ODM3MFxuXG52YXIgR0xfVEVYVFVSRV9NQUdfRklMVEVSID0gMHgyODAwXG52YXIgR0xfVEVYVFVSRV9NSU5fRklMVEVSID0gMHgyODAxXG5cbnZhciBHTF9ORUFSRVNUID0gMHgyNjAwXG52YXIgR0xfTElORUFSID0gMHgyNjAxXG52YXIgR0xfTkVBUkVTVF9NSVBNQVBfTkVBUkVTVCA9IDB4MjcwMFxudmFyIEdMX0xJTkVBUl9NSVBNQVBfTkVBUkVTVCA9IDB4MjcwMVxudmFyIEdMX05FQVJFU1RfTUlQTUFQX0xJTkVBUiA9IDB4MjcwMlxudmFyIEdMX0xJTkVBUl9NSVBNQVBfTElORUFSID0gMHgyNzAzXG5cbnZhciBHTF9HRU5FUkFURV9NSVBNQVBfSElOVCA9IDB4ODE5MlxudmFyIEdMX0RPTlRfQ0FSRSA9IDB4MTEwMFxudmFyIEdMX0ZBU1RFU1QgPSAweDExMDFcbnZhciBHTF9OSUNFU1QgPSAweDExMDJcblxudmFyIEdMX1RFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhUID0gMHg4NEZFXG5cbnZhciBHTF9VTlBBQ0tfQUxJR05NRU5UID0gMHgwQ0Y1XG52YXIgR0xfVU5QQUNLX0ZMSVBfWV9XRUJHTCA9IDB4OTI0MFxudmFyIEdMX1VOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCA9IDB4OTI0MVxudmFyIEdMX1VOUEFDS19DT0xPUlNQQUNFX0NPTlZFUlNJT05fV0VCR0wgPSAweDkyNDNcblxudmFyIEdMX0JST1dTRVJfREVGQVVMVF9XRUJHTCA9IDB4OTI0NFxuXG52YXIgR0xfVEVYVFVSRTAgPSAweDg0QzBcblxudmFyIE1JUE1BUF9GSUxURVJTID0gW1xuICBHTF9ORUFSRVNUX01JUE1BUF9ORUFSRVNULFxuICBHTF9ORUFSRVNUX01JUE1BUF9MSU5FQVIsXG4gIEdMX0xJTkVBUl9NSVBNQVBfTkVBUkVTVCxcbiAgR0xfTElORUFSX01JUE1BUF9MSU5FQVJcbl1cblxudmFyIENIQU5ORUxTX0ZPUk1BVCA9IFtcbiAgMCxcbiAgR0xfTFVNSU5BTkNFLFxuICBHTF9MVU1JTkFOQ0VfQUxQSEEsXG4gIEdMX1JHQixcbiAgR0xfUkdCQVxuXVxuXG52YXIgRk9STUFUX0NIQU5ORUxTID0ge31cbkZPUk1BVF9DSEFOTkVMU1tHTF9MVU1JTkFOQ0VdID1cbkZPUk1BVF9DSEFOTkVMU1tHTF9BTFBIQV0gPVxuRk9STUFUX0NIQU5ORUxTW0dMX0RFUFRIX0NPTVBPTkVOVF0gPSAxXG5GT1JNQVRfQ0hBTk5FTFNbR0xfREVQVEhfU1RFTkNJTF0gPVxuRk9STUFUX0NIQU5ORUxTW0dMX0xVTUlOQU5DRV9BTFBIQV0gPSAyXG5GT1JNQVRfQ0hBTk5FTFNbR0xfUkdCXSA9XG5GT1JNQVRfQ0hBTk5FTFNbR0xfU1JHQl9FWFRdID0gM1xuRk9STUFUX0NIQU5ORUxTW0dMX1JHQkFdID1cbkZPUk1BVF9DSEFOTkVMU1tHTF9TUkdCX0FMUEhBX0VYVF0gPSA0XG5cbnZhciBmb3JtYXRUeXBlcyA9IHt9XG5mb3JtYXRUeXBlc1tHTF9SR0JBNF0gPSBHTF9VTlNJR05FRF9TSE9SVF80XzRfNF80XG5mb3JtYXRUeXBlc1tHTF9SR0I1NjVdID0gR0xfVU5TSUdORURfU0hPUlRfNV82XzVcbmZvcm1hdFR5cGVzW0dMX1JHQjVfQTFdID0gR0xfVU5TSUdORURfU0hPUlRfNV81XzVfMVxuZm9ybWF0VHlwZXNbR0xfREVQVEhfQ09NUE9ORU5UXSA9IEdMX1VOU0lHTkVEX0lOVFxuZm9ybWF0VHlwZXNbR0xfREVQVEhfU1RFTkNJTF0gPSBHTF9VTlNJR05FRF9JTlRfMjRfOF9XRUJHTFxuXG5mdW5jdGlvbiBvYmplY3ROYW1lIChzdHIpIHtcbiAgcmV0dXJuICdbb2JqZWN0ICcgKyBzdHIgKyAnXSdcbn1cblxudmFyIENBTlZBU19DTEFTUyA9IG9iamVjdE5hbWUoJ0hUTUxDYW52YXNFbGVtZW50JylcbnZhciBDT05URVhUMkRfQ0xBU1MgPSBvYmplY3ROYW1lKCdDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQnKVxudmFyIElNQUdFX0NMQVNTID0gb2JqZWN0TmFtZSgnSFRNTEltYWdlRWxlbWVudCcpXG52YXIgVklERU9fQ0xBU1MgPSBvYmplY3ROYW1lKCdIVE1MVmlkZW9FbGVtZW50JylcblxudmFyIFBJWEVMX0NMQVNTRVMgPSBPYmplY3Qua2V5cyhkdHlwZXMpLmNvbmNhdChbXG4gIENBTlZBU19DTEFTUyxcbiAgQ09OVEVYVDJEX0NMQVNTLFxuICBJTUFHRV9DTEFTUyxcbiAgVklERU9fQ0xBU1Ncbl0pXG5cbi8vIGZvciBldmVyeSB0ZXh0dXJlIHR5cGUsIHN0b3JlXG4vLyB0aGUgc2l6ZSBpbiBieXRlcy5cbnZhciBUWVBFX1NJWkVTID0gW11cblRZUEVfU0laRVNbR0xfVU5TSUdORURfQllURV0gPSAxXG5UWVBFX1NJWkVTW0dMX0ZMT0FUXSA9IDRcblRZUEVfU0laRVNbR0xfSEFMRl9GTE9BVF9PRVNdID0gMlxuXG5UWVBFX1NJWkVTW0dMX1VOU0lHTkVEX1NIT1JUXSA9IDJcblRZUEVfU0laRVNbR0xfVU5TSUdORURfSU5UXSA9IDRcblxudmFyIEZPUk1BVF9TSVpFU19TUEVDSUFMID0gW11cbkZPUk1BVF9TSVpFU19TUEVDSUFMW0dMX1JHQkE0XSA9IDJcbkZPUk1BVF9TSVpFU19TUEVDSUFMW0dMX1JHQjVfQTFdID0gMlxuRk9STUFUX1NJWkVTX1NQRUNJQUxbR0xfUkdCNTY1XSA9IDJcbkZPUk1BVF9TSVpFU19TUEVDSUFMW0dMX0RFUFRIX1NURU5DSUxdID0gNFxuXG5GT1JNQVRfU0laRVNfU1BFQ0lBTFtHTF9DT01QUkVTU0VEX1JHQl9TM1RDX0RYVDFfRVhUXSA9IDAuNVxuRk9STUFUX1NJWkVTX1NQRUNJQUxbR0xfQ09NUFJFU1NFRF9SR0JBX1MzVENfRFhUMV9FWFRdID0gMC41XG5GT1JNQVRfU0laRVNfU1BFQ0lBTFtHTF9DT01QUkVTU0VEX1JHQkFfUzNUQ19EWFQzX0VYVF0gPSAxXG5GT1JNQVRfU0laRVNfU1BFQ0lBTFtHTF9DT01QUkVTU0VEX1JHQkFfUzNUQ19EWFQ1X0VYVF0gPSAxXG5cbkZPUk1BVF9TSVpFU19TUEVDSUFMW0dMX0NPTVBSRVNTRURfUkdCX0FUQ19XRUJHTF0gPSAwLjVcbkZPUk1BVF9TSVpFU19TUEVDSUFMW0dMX0NPTVBSRVNTRURfUkdCQV9BVENfRVhQTElDSVRfQUxQSEFfV0VCR0xdID0gMVxuRk9STUFUX1NJWkVTX1NQRUNJQUxbR0xfQ09NUFJFU1NFRF9SR0JBX0FUQ19JTlRFUlBPTEFURURfQUxQSEFfV0VCR0xdID0gMVxuXG5GT1JNQVRfU0laRVNfU1BFQ0lBTFtHTF9DT01QUkVTU0VEX1JHQl9QVlJUQ180QlBQVjFfSU1HXSA9IDAuNVxuRk9STUFUX1NJWkVTX1NQRUNJQUxbR0xfQ09NUFJFU1NFRF9SR0JfUFZSVENfMkJQUFYxX0lNR10gPSAwLjI1XG5GT1JNQVRfU0laRVNfU1BFQ0lBTFtHTF9DT01QUkVTU0VEX1JHQkFfUFZSVENfNEJQUFYxX0lNR10gPSAwLjVcbkZPUk1BVF9TSVpFU19TUEVDSUFMW0dMX0NPTVBSRVNTRURfUkdCQV9QVlJUQ18yQlBQVjFfSU1HXSA9IDAuMjVcblxuRk9STUFUX1NJWkVTX1NQRUNJQUxbR0xfQ09NUFJFU1NFRF9SR0JfRVRDMV9XRUJHTF0gPSAwLjVcblxuZnVuY3Rpb24gaXNOdW1lcmljQXJyYXkgKGFycikge1xuICByZXR1cm4gKFxuICAgIEFycmF5LmlzQXJyYXkoYXJyKSAmJlxuICAgIChhcnIubGVuZ3RoID09PSAwIHx8XG4gICAgdHlwZW9mIGFyclswXSA9PT0gJ251bWJlcicpKVxufVxuXG5mdW5jdGlvbiBpc1JlY3RBcnJheSAoYXJyKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgdmFyIHdpZHRoID0gYXJyLmxlbmd0aFxuICBpZiAod2lkdGggPT09IDAgfHwgIWlzQXJyYXlMaWtlKGFyclswXSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBjbGFzc1N0cmluZyAoeCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpXG59XG5cbmZ1bmN0aW9uIGlzQ2FudmFzRWxlbWVudCAob2JqZWN0KSB7XG4gIHJldHVybiBjbGFzc1N0cmluZyhvYmplY3QpID09PSBDQU5WQVNfQ0xBU1Ncbn1cblxuZnVuY3Rpb24gaXNDb250ZXh0MkQgKG9iamVjdCkge1xuICByZXR1cm4gY2xhc3NTdHJpbmcob2JqZWN0KSA9PT0gQ09OVEVYVDJEX0NMQVNTXG59XG5cbmZ1bmN0aW9uIGlzSW1hZ2VFbGVtZW50IChvYmplY3QpIHtcbiAgcmV0dXJuIGNsYXNzU3RyaW5nKG9iamVjdCkgPT09IElNQUdFX0NMQVNTXG59XG5cbmZ1bmN0aW9uIGlzVmlkZW9FbGVtZW50IChvYmplY3QpIHtcbiAgcmV0dXJuIGNsYXNzU3RyaW5nKG9iamVjdCkgPT09IFZJREVPX0NMQVNTXG59XG5cbmZ1bmN0aW9uIGlzUGl4ZWxEYXRhIChvYmplY3QpIHtcbiAgaWYgKCFvYmplY3QpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICB2YXIgY2xhc3NOYW1lID0gY2xhc3NTdHJpbmcob2JqZWN0KVxuICBpZiAoUElYRUxfQ0xBU1NFUy5pbmRleE9mKGNsYXNzTmFtZSkgPj0gMCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmV0dXJuIChcbiAgICBpc051bWVyaWNBcnJheShvYmplY3QpIHx8XG4gICAgaXNSZWN0QXJyYXkob2JqZWN0KSB8fFxuICAgIGlzTkRBcnJheUxpa2Uob2JqZWN0KSlcbn1cblxuZnVuY3Rpb24gdHlwZWRBcnJheUNvZGUgKGRhdGEpIHtcbiAgcmV0dXJuIGFycmF5VHlwZXNbT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpXSB8IDBcbn1cblxuZnVuY3Rpb24gY29udmVydERhdGEgKHJlc3VsdCwgZGF0YSkge1xuICB2YXIgbiA9IHJlc3VsdC53aWR0aCAqIHJlc3VsdC5oZWlnaHQgKiByZXN1bHQuY2hhbm5lbHNcbiAgXG5cbiAgc3dpdGNoIChyZXN1bHQudHlwZSkge1xuICAgIGNhc2UgR0xfVU5TSUdORURfQllURTpcbiAgICBjYXNlIEdMX1VOU0lHTkVEX1NIT1JUOlxuICAgIGNhc2UgR0xfVU5TSUdORURfSU5UOlxuICAgIGNhc2UgR0xfRkxPQVQ6XG4gICAgICB2YXIgY29udmVydGVkID0gcG9vbC5hbGxvY1R5cGUocmVzdWx0LnR5cGUsIG4pXG4gICAgICBjb252ZXJ0ZWQuc2V0KGRhdGEpXG4gICAgICByZXN1bHQuZGF0YSA9IGNvbnZlcnRlZFxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgR0xfSEFMRl9GTE9BVF9PRVM6XG4gICAgICByZXN1bHQuZGF0YSA9IGNvbnZlcnRUb0hhbGZGbG9hdChkYXRhKVxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gICAgICBcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmVDb252ZXJ0IChpbWFnZSwgbikge1xuICByZXR1cm4gcG9vbC5hbGxvY1R5cGUoXG4gICAgaW1hZ2UudHlwZSA9PT0gR0xfSEFMRl9GTE9BVF9PRVNcbiAgICAgID8gR0xfRkxPQVRcbiAgICAgIDogaW1hZ2UudHlwZSwgbilcbn1cblxuZnVuY3Rpb24gcG9zdENvbnZlcnQgKGltYWdlLCBkYXRhKSB7XG4gIGlmIChpbWFnZS50eXBlID09PSBHTF9IQUxGX0ZMT0FUX09FUykge1xuICAgIGltYWdlLmRhdGEgPSBjb252ZXJ0VG9IYWxmRmxvYXQoZGF0YSlcbiAgICBwb29sLmZyZWVUeXBlKGRhdGEpXG4gIH0gZWxzZSB7XG4gICAgaW1hZ2UuZGF0YSA9IGRhdGFcbiAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc3Bvc2VEYXRhIChpbWFnZSwgYXJyYXksIHN0cmlkZVgsIHN0cmlkZVksIHN0cmlkZUMsIG9mZnNldCkge1xuICB2YXIgdyA9IGltYWdlLndpZHRoXG4gIHZhciBoID0gaW1hZ2UuaGVpZ2h0XG4gIHZhciBjID0gaW1hZ2UuY2hhbm5lbHNcbiAgdmFyIG4gPSB3ICogaCAqIGNcbiAgdmFyIGRhdGEgPSBwcmVDb252ZXJ0KGltYWdlLCBuKVxuXG4gIHZhciBwID0gMFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGg7ICsraSkge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdzsgKytqKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IGM7ICsraykge1xuICAgICAgICBkYXRhW3ArK10gPSBhcnJheVtzdHJpZGVYICogaiArIHN0cmlkZVkgKiBpICsgc3RyaWRlQyAqIGsgKyBvZmZzZXRdXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcG9zdENvbnZlcnQoaW1hZ2UsIGRhdGEpXG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4yRERhdGEgKGltYWdlLCBhcnJheSwgdywgaCkge1xuICB2YXIgbiA9IHcgKiBoXG4gIHZhciBkYXRhID0gcHJlQ29udmVydChpbWFnZSwgbilcblxuICB2YXIgcCA9IDBcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBoOyArK2kpIHtcbiAgICB2YXIgcm93ID0gYXJyYXlbaV1cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHc7ICsraikge1xuICAgICAgZGF0YVtwKytdID0gcm93W2pdXG4gICAgfVxuICB9XG5cbiAgcG9zdENvbnZlcnQoaW1hZ2UsIGRhdGEpXG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4zRERhdGEgKGltYWdlLCBhcnJheSwgdywgaCwgYykge1xuICB2YXIgbiA9IHcgKiBoICogY1xuICB2YXIgZGF0YSA9IHByZUNvbnZlcnQoaW1hZ2UsIG4pXG5cbiAgdmFyIHAgPSAwXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaDsgKytpKSB7XG4gICAgdmFyIHJvdyA9IGFycmF5W2ldXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB3OyArK2opIHtcbiAgICAgIHZhciBwaXhlbCA9IHJvd1tqXVxuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBjOyArK2spIHtcbiAgICAgICAgZGF0YVtwKytdID0gcGl4ZWxba11cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwb3N0Q29udmVydChpbWFnZSwgZGF0YSlcbn1cblxuZnVuY3Rpb24gZ2V0VGV4dHVyZVNpemUgKGZvcm1hdCwgdHlwZSwgd2lkdGgsIGhlaWdodCwgaXNNaXBtYXAsIGlzQ3ViZSkge1xuICB2YXIgc1xuICBpZiAodHlwZW9mIEZPUk1BVF9TSVpFU19TUEVDSUFMW2Zvcm1hdF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gd2UgaGF2ZSBhIHNwZWNpYWwgYXJyYXkgZm9yIGRlYWxpbmcgd2l0aCB3ZWlyZCBjb2xvciBmb3JtYXRzIHN1Y2ggYXMgUkdCNUExXG4gICAgcyA9IEZPUk1BVF9TSVpFU19TUEVDSUFMW2Zvcm1hdF1cbiAgfSBlbHNlIHtcbiAgICBzID0gRk9STUFUX0NIQU5ORUxTW2Zvcm1hdF0gKiBUWVBFX1NJWkVTW3R5cGVdXG4gIH1cblxuICBpZiAoaXNDdWJlKSB7XG4gICAgcyAqPSA2XG4gIH1cblxuICBpZiAoaXNNaXBtYXApIHtcbiAgICAvLyBjb21wdXRlIHRoZSB0b3RhbCBzaXplIG9mIGFsbCB0aGUgbWlwbWFwcy5cbiAgICB2YXIgdG90YWwgPSAwXG5cbiAgICB2YXIgdyA9IHdpZHRoXG4gICAgd2hpbGUgKHcgPj0gMSkge1xuICAgICAgLy8gd2UgY2FuIG9ubHkgdXNlIG1pcG1hcHMgb24gYSBzcXVhcmUgaW1hZ2UsXG4gICAgICAvLyBzbyB3ZSBjYW4gc2ltcGx5IHVzZSB0aGUgd2lkdGggYW5kIGlnbm9yZSB0aGUgaGVpZ2h0OlxuICAgICAgdG90YWwgKz0gcyAqIHcgKiB3XG4gICAgICB3IC89IDJcbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHMgKiB3aWR0aCAqIGhlaWdodFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlVGV4dHVyZVNldCAoXG4gIGdsLCBleHRlbnNpb25zLCBsaW1pdHMsIHJlZ2xQb2xsLCBjb250ZXh0U3RhdGUsIHN0YXRzLCBjb25maWcpIHtcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBJbml0aWFsaXplIGNvbnN0YW50cyBhbmQgcGFyYW1ldGVyIHRhYmxlcyBoZXJlXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdmFyIG1pcG1hcEhpbnQgPSB7XG4gICAgXCJkb24ndCBjYXJlXCI6IEdMX0RPTlRfQ0FSRSxcbiAgICAnZG9udCBjYXJlJzogR0xfRE9OVF9DQVJFLFxuICAgICduaWNlJzogR0xfTklDRVNULFxuICAgICdmYXN0JzogR0xfRkFTVEVTVFxuICB9XG5cbiAgdmFyIHdyYXBNb2RlcyA9IHtcbiAgICAncmVwZWF0JzogR0xfUkVQRUFULFxuICAgICdjbGFtcCc6IEdMX0NMQU1QX1RPX0VER0UsXG4gICAgJ21pcnJvcic6IEdMX01JUlJPUkVEX1JFUEVBVFxuICB9XG5cbiAgdmFyIG1hZ0ZpbHRlcnMgPSB7XG4gICAgJ25lYXJlc3QnOiBHTF9ORUFSRVNULFxuICAgICdsaW5lYXInOiBHTF9MSU5FQVJcbiAgfVxuXG4gIHZhciBtaW5GaWx0ZXJzID0gZXh0ZW5kKHtcbiAgICAnbmVhcmVzdCBtaXBtYXAgbmVhcmVzdCc6IEdMX05FQVJFU1RfTUlQTUFQX05FQVJFU1QsXG4gICAgJ2xpbmVhciBtaXBtYXAgbmVhcmVzdCc6IEdMX0xJTkVBUl9NSVBNQVBfTkVBUkVTVCxcbiAgICAnbmVhcmVzdCBtaXBtYXAgbGluZWFyJzogR0xfTkVBUkVTVF9NSVBNQVBfTElORUFSLFxuICAgICdsaW5lYXIgbWlwbWFwIGxpbmVhcic6IEdMX0xJTkVBUl9NSVBNQVBfTElORUFSLFxuICAgICdtaXBtYXAnOiBHTF9MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICB9LCBtYWdGaWx0ZXJzKVxuXG4gIHZhciBjb2xvclNwYWNlID0ge1xuICAgICdub25lJzogMCxcbiAgICAnYnJvd3Nlcic6IEdMX0JST1dTRVJfREVGQVVMVF9XRUJHTFxuICB9XG5cbiAgdmFyIHRleHR1cmVUeXBlcyA9IHtcbiAgICAndWludDgnOiBHTF9VTlNJR05FRF9CWVRFLFxuICAgICdyZ2JhNCc6IEdMX1VOU0lHTkVEX1NIT1JUXzRfNF80XzQsXG4gICAgJ3JnYjU2NSc6IEdMX1VOU0lHTkVEX1NIT1JUXzVfNl81LFxuICAgICdyZ2I1IGExJzogR0xfVU5TSUdORURfU0hPUlRfNV81XzVfMVxuICB9XG5cbiAgdmFyIHRleHR1cmVGb3JtYXRzID0ge1xuICAgICdhbHBoYSc6IEdMX0FMUEhBLFxuICAgICdsdW1pbmFuY2UnOiBHTF9MVU1JTkFOQ0UsXG4gICAgJ2x1bWluYW5jZSBhbHBoYSc6IEdMX0xVTUlOQU5DRV9BTFBIQSxcbiAgICAncmdiJzogR0xfUkdCLFxuICAgICdyZ2JhJzogR0xfUkdCQSxcbiAgICAncmdiYTQnOiBHTF9SR0JBNCxcbiAgICAncmdiNSBhMSc6IEdMX1JHQjVfQTEsXG4gICAgJ3JnYjU2NSc6IEdMX1JHQjU2NVxuICB9XG5cbiAgdmFyIGNvbXByZXNzZWRUZXh0dXJlRm9ybWF0cyA9IHt9XG5cbiAgaWYgKGV4dGVuc2lvbnMuZXh0X3NyZ2IpIHtcbiAgICB0ZXh0dXJlRm9ybWF0cy5zcmdiID0gR0xfU1JHQl9FWFRcbiAgICB0ZXh0dXJlRm9ybWF0cy5zcmdiYSA9IEdMX1NSR0JfQUxQSEFfRVhUXG4gIH1cblxuICBpZiAoZXh0ZW5zaW9ucy5vZXNfdGV4dHVyZV9mbG9hdCkge1xuICAgIHRleHR1cmVUeXBlcy5mbG9hdDMyID0gdGV4dHVyZVR5cGVzLmZsb2F0ID0gR0xfRkxPQVRcbiAgfVxuXG4gIGlmIChleHRlbnNpb25zLm9lc190ZXh0dXJlX2hhbGZfZmxvYXQpIHtcbiAgICB0ZXh0dXJlVHlwZXNbJ2Zsb2F0MTYnXSA9IHRleHR1cmVUeXBlc1snaGFsZiBmbG9hdCddID0gR0xfSEFMRl9GTE9BVF9PRVNcbiAgfVxuXG4gIGlmIChleHRlbnNpb25zLndlYmdsX2RlcHRoX3RleHR1cmUpIHtcbiAgICBleHRlbmQodGV4dHVyZUZvcm1hdHMsIHtcbiAgICAgICdkZXB0aCc6IEdMX0RFUFRIX0NPTVBPTkVOVCxcbiAgICAgICdkZXB0aCBzdGVuY2lsJzogR0xfREVQVEhfU1RFTkNJTFxuICAgIH0pXG5cbiAgICBleHRlbmQodGV4dHVyZVR5cGVzLCB7XG4gICAgICAndWludDE2JzogR0xfVU5TSUdORURfU0hPUlQsXG4gICAgICAndWludDMyJzogR0xfVU5TSUdORURfSU5ULFxuICAgICAgJ2RlcHRoIHN0ZW5jaWwnOiBHTF9VTlNJR05FRF9JTlRfMjRfOF9XRUJHTFxuICAgIH0pXG4gIH1cblxuICBpZiAoZXh0ZW5zaW9ucy53ZWJnbF9jb21wcmVzc2VkX3RleHR1cmVfczN0Yykge1xuICAgIGV4dGVuZChjb21wcmVzc2VkVGV4dHVyZUZvcm1hdHMsIHtcbiAgICAgICdyZ2IgczN0YyBkeHQxJzogR0xfQ09NUFJFU1NFRF9SR0JfUzNUQ19EWFQxX0VYVCxcbiAgICAgICdyZ2JhIHMzdGMgZHh0MSc6IEdMX0NPTVBSRVNTRURfUkdCQV9TM1RDX0RYVDFfRVhULFxuICAgICAgJ3JnYmEgczN0YyBkeHQzJzogR0xfQ09NUFJFU1NFRF9SR0JBX1MzVENfRFhUM19FWFQsXG4gICAgICAncmdiYSBzM3RjIGR4dDUnOiBHTF9DT01QUkVTU0VEX1JHQkFfUzNUQ19EWFQ1X0VYVFxuICAgIH0pXG4gIH1cblxuICBpZiAoZXh0ZW5zaW9ucy53ZWJnbF9jb21wcmVzc2VkX3RleHR1cmVfYXRjKSB7XG4gICAgZXh0ZW5kKGNvbXByZXNzZWRUZXh0dXJlRm9ybWF0cywge1xuICAgICAgJ3JnYiBhdGMnOiBHTF9DT01QUkVTU0VEX1JHQl9BVENfV0VCR0wsXG4gICAgICAncmdiYSBhdGMgZXhwbGljaXQgYWxwaGEnOiBHTF9DT01QUkVTU0VEX1JHQkFfQVRDX0VYUExJQ0lUX0FMUEhBX1dFQkdMLFxuICAgICAgJ3JnYmEgYXRjIGludGVycG9sYXRlZCBhbHBoYSc6IEdMX0NPTVBSRVNTRURfUkdCQV9BVENfSU5URVJQT0xBVEVEX0FMUEhBX1dFQkdMXG4gICAgfSlcbiAgfVxuXG4gIGlmIChleHRlbnNpb25zLndlYmdsX2NvbXByZXNzZWRfdGV4dHVyZV9wdnJ0Yykge1xuICAgIGV4dGVuZChjb21wcmVzc2VkVGV4dHVyZUZvcm1hdHMsIHtcbiAgICAgICdyZ2IgcHZydGMgNGJwcHYxJzogR0xfQ09NUFJFU1NFRF9SR0JfUFZSVENfNEJQUFYxX0lNRyxcbiAgICAgICdyZ2IgcHZydGMgMmJwcHYxJzogR0xfQ09NUFJFU1NFRF9SR0JfUFZSVENfMkJQUFYxX0lNRyxcbiAgICAgICdyZ2JhIHB2cnRjIDRicHB2MSc6IEdMX0NPTVBSRVNTRURfUkdCQV9QVlJUQ180QlBQVjFfSU1HLFxuICAgICAgJ3JnYmEgcHZydGMgMmJwcHYxJzogR0xfQ09NUFJFU1NFRF9SR0JBX1BWUlRDXzJCUFBWMV9JTUdcbiAgICB9KVxuICB9XG5cbiAgaWYgKGV4dGVuc2lvbnMud2ViZ2xfY29tcHJlc3NlZF90ZXh0dXJlX2V0YzEpIHtcbiAgICBjb21wcmVzc2VkVGV4dHVyZUZvcm1hdHNbJ3JnYiBldGMxJ10gPSBHTF9DT01QUkVTU0VEX1JHQl9FVEMxX1dFQkdMXG4gIH1cblxuICAvLyBDb3B5IG92ZXIgYWxsIHRleHR1cmUgZm9ybWF0c1xuICB2YXIgc3VwcG9ydGVkQ29tcHJlc3NlZEZvcm1hdHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcbiAgICBnbC5nZXRQYXJhbWV0ZXIoR0xfQ09NUFJFU1NFRF9URVhUVVJFX0ZPUk1BVFMpKVxuICBPYmplY3Qua2V5cyhjb21wcmVzc2VkVGV4dHVyZUZvcm1hdHMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgZm9ybWF0ID0gY29tcHJlc3NlZFRleHR1cmVGb3JtYXRzW25hbWVdXG4gICAgaWYgKHN1cHBvcnRlZENvbXByZXNzZWRGb3JtYXRzLmluZGV4T2YoZm9ybWF0KSA+PSAwKSB7XG4gICAgICB0ZXh0dXJlRm9ybWF0c1tuYW1lXSA9IGZvcm1hdFxuICAgIH1cbiAgfSlcblxuICB2YXIgc3VwcG9ydGVkRm9ybWF0cyA9IE9iamVjdC5rZXlzKHRleHR1cmVGb3JtYXRzKVxuICBsaW1pdHMudGV4dHVyZUZvcm1hdHMgPSBzdXBwb3J0ZWRGb3JtYXRzXG5cbiAgLy8gY29sb3JGb3JtYXRzW10gZ2l2ZXMgdGhlIGZvcm1hdCAoY2hhbm5lbHMpIGFzc29jaWF0ZWQgdG8gYW5cbiAgLy8gaW50ZXJuYWxmb3JtYXRcbiAgdmFyIGNvbG9yRm9ybWF0cyA9IHN1cHBvcnRlZEZvcm1hdHMucmVkdWNlKGZ1bmN0aW9uIChjb2xvciwga2V5KSB7XG4gICAgdmFyIGdsZW51bSA9IHRleHR1cmVGb3JtYXRzW2tleV1cbiAgICBpZiAoZ2xlbnVtID09PSBHTF9MVU1JTkFOQ0UgfHxcbiAgICAgICAgZ2xlbnVtID09PSBHTF9BTFBIQSB8fFxuICAgICAgICBnbGVudW0gPT09IEdMX0xVTUlOQU5DRSB8fFxuICAgICAgICBnbGVudW0gPT09IEdMX0xVTUlOQU5DRV9BTFBIQSB8fFxuICAgICAgICBnbGVudW0gPT09IEdMX0RFUFRIX0NPTVBPTkVOVCB8fFxuICAgICAgICBnbGVudW0gPT09IEdMX0RFUFRIX1NURU5DSUwpIHtcbiAgICAgIGNvbG9yW2dsZW51bV0gPSBnbGVudW1cbiAgICB9IGVsc2UgaWYgKGdsZW51bSA9PT0gR0xfUkdCNV9BMSB8fCBrZXkuaW5kZXhPZigncmdiYScpID49IDApIHtcbiAgICAgIGNvbG9yW2dsZW51bV0gPSBHTF9SR0JBXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbG9yW2dsZW51bV0gPSBHTF9SR0JcbiAgICB9XG4gICAgcmV0dXJuIGNvbG9yXG4gIH0sIHt9KVxuXG4gIGZ1bmN0aW9uIFRleEZsYWdzICgpIHtcbiAgICAvLyBmb3JtYXQgaW5mb1xuICAgIHRoaXMuaW50ZXJuYWxmb3JtYXQgPSBHTF9SR0JBXG4gICAgdGhpcy5mb3JtYXQgPSBHTF9SR0JBXG4gICAgdGhpcy50eXBlID0gR0xfVU5TSUdORURfQllURVxuICAgIHRoaXMuY29tcHJlc3NlZCA9IGZhbHNlXG5cbiAgICAvLyBwaXhlbCBzdG9yYWdlXG4gICAgdGhpcy5wcmVtdWx0aXBseUFscGhhID0gZmFsc2VcbiAgICB0aGlzLmZsaXBZID0gZmFsc2VcbiAgICB0aGlzLnVucGFja0FsaWdubWVudCA9IDFcbiAgICB0aGlzLmNvbG9yU3BhY2UgPSAwXG5cbiAgICAvLyBzaGFwZSBpbmZvXG4gICAgdGhpcy53aWR0aCA9IDBcbiAgICB0aGlzLmhlaWdodCA9IDBcbiAgICB0aGlzLmNoYW5uZWxzID0gNFxuICB9XG5cbiAgZnVuY3Rpb24gY29weUZsYWdzIChyZXN1bHQsIG90aGVyKSB7XG4gICAgcmVzdWx0LmludGVybmFsZm9ybWF0ID0gb3RoZXIuaW50ZXJuYWxmb3JtYXRcbiAgICByZXN1bHQuZm9ybWF0ID0gb3RoZXIuZm9ybWF0XG4gICAgcmVzdWx0LnR5cGUgPSBvdGhlci50eXBlXG4gICAgcmVzdWx0LmNvbXByZXNzZWQgPSBvdGhlci5jb21wcmVzc2VkXG5cbiAgICByZXN1bHQucHJlbXVsdGlwbHlBbHBoYSA9IG90aGVyLnByZW11bHRpcGx5QWxwaGFcbiAgICByZXN1bHQuZmxpcFkgPSBvdGhlci5mbGlwWVxuICAgIHJlc3VsdC51bnBhY2tBbGlnbm1lbnQgPSBvdGhlci51bnBhY2tBbGlnbm1lbnRcbiAgICByZXN1bHQuY29sb3JTcGFjZSA9IG90aGVyLmNvbG9yU3BhY2VcblxuICAgIHJlc3VsdC53aWR0aCA9IG90aGVyLndpZHRoXG4gICAgcmVzdWx0LmhlaWdodCA9IG90aGVyLmhlaWdodFxuICAgIHJlc3VsdC5jaGFubmVscyA9IG90aGVyLmNoYW5uZWxzXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUZsYWdzIChmbGFncywgb3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcgfHwgIW9wdGlvbnMpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICgncHJlbXVsdGlwbHlBbHBoYScgaW4gb3B0aW9ucykge1xuICAgICAgXG4gICAgICBmbGFncy5wcmVtdWx0aXBseUFscGhhID0gb3B0aW9ucy5wcmVtdWx0aXBseUFscGhhXG4gICAgfVxuXG4gICAgaWYgKCdmbGlwWScgaW4gb3B0aW9ucykge1xuICAgICAgXG4gICAgICBmbGFncy5mbGlwWSA9IG9wdGlvbnMuZmxpcFlcbiAgICB9XG5cbiAgICBpZiAoJ2FsaWdubWVudCcgaW4gb3B0aW9ucykge1xuICAgICAgXG4gICAgICBmbGFncy51bnBhY2tBbGlnbm1lbnQgPSBvcHRpb25zLmFsaWdubWVudFxuICAgIH1cblxuICAgIGlmICgnY29sb3JTcGFjZScgaW4gb3B0aW9ucykge1xuICAgICAgXG4gICAgICBmbGFncy5jb2xvclNwYWNlID0gY29sb3JTcGFjZVtvcHRpb25zLmNvbG9yU3BhY2VdXG4gICAgfVxuXG4gICAgaWYgKCd0eXBlJyBpbiBvcHRpb25zKSB7XG4gICAgICB2YXIgdHlwZSA9IG9wdGlvbnMudHlwZVxuICAgICAgXG4gICAgICBcbiAgICAgIFxuICAgICAgXG4gICAgICBmbGFncy50eXBlID0gdGV4dHVyZVR5cGVzW3R5cGVdXG4gICAgfVxuXG4gICAgdmFyIHcgPSBmbGFncy53aWR0aFxuICAgIHZhciBoID0gZmxhZ3MuaGVpZ2h0XG4gICAgdmFyIGMgPSBmbGFncy5jaGFubmVsc1xuICAgIHZhciBoYXNDaGFubmVscyA9IGZhbHNlXG4gICAgaWYgKCdzaGFwZScgaW4gb3B0aW9ucykge1xuICAgICAgXG4gICAgICB3ID0gb3B0aW9ucy5zaGFwZVswXVxuICAgICAgaCA9IG9wdGlvbnMuc2hhcGVbMV1cbiAgICAgIGlmIChvcHRpb25zLnNoYXBlLmxlbmd0aCA9PT0gMykge1xuICAgICAgICBjID0gb3B0aW9ucy5zaGFwZVsyXVxuICAgICAgICBcbiAgICAgICAgaGFzQ2hhbm5lbHMgPSB0cnVlXG4gICAgICB9XG4gICAgICBcbiAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoJ3JhZGl1cycgaW4gb3B0aW9ucykge1xuICAgICAgICB3ID0gaCA9IG9wdGlvbnMucmFkaXVzXG4gICAgICAgIFxuICAgICAgfVxuICAgICAgaWYgKCd3aWR0aCcgaW4gb3B0aW9ucykge1xuICAgICAgICB3ID0gb3B0aW9ucy53aWR0aFxuICAgICAgICBcbiAgICAgIH1cbiAgICAgIGlmICgnaGVpZ2h0JyBpbiBvcHRpb25zKSB7XG4gICAgICAgIGggPSBvcHRpb25zLmhlaWdodFxuICAgICAgICBcbiAgICAgIH1cbiAgICAgIGlmICgnY2hhbm5lbHMnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgYyA9IG9wdGlvbnMuY2hhbm5lbHNcbiAgICAgICAgXG4gICAgICAgIGhhc0NoYW5uZWxzID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgICBmbGFncy53aWR0aCA9IHcgfCAwXG4gICAgZmxhZ3MuaGVpZ2h0ID0gaCB8IDBcbiAgICBmbGFncy5jaGFubmVscyA9IGMgfCAwXG5cbiAgICB2YXIgaGFzRm9ybWF0ID0gZmFsc2VcbiAgICBpZiAoJ2Zvcm1hdCcgaW4gb3B0aW9ucykge1xuICAgICAgdmFyIGZvcm1hdFN0ciA9IG9wdGlvbnMuZm9ybWF0XG4gICAgICBcbiAgICAgIFxuICAgICAgdmFyIGludGVybmFsZm9ybWF0ID0gZmxhZ3MuaW50ZXJuYWxmb3JtYXQgPSB0ZXh0dXJlRm9ybWF0c1tmb3JtYXRTdHJdXG4gICAgICBmbGFncy5mb3JtYXQgPSBjb2xvckZvcm1hdHNbaW50ZXJuYWxmb3JtYXRdXG4gICAgICBpZiAoZm9ybWF0U3RyIGluIHRleHR1cmVUeXBlcykge1xuICAgICAgICBpZiAoISgndHlwZScgaW4gb3B0aW9ucykpIHtcbiAgICAgICAgICBmbGFncy50eXBlID0gdGV4dHVyZVR5cGVzW2Zvcm1hdFN0cl1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvcm1hdFN0ciBpbiBjb21wcmVzc2VkVGV4dHVyZUZvcm1hdHMpIHtcbiAgICAgICAgZmxhZ3MuY29tcHJlc3NlZCA9IHRydWVcbiAgICAgIH1cbiAgICAgIGhhc0Zvcm1hdCA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBSZWNvbmNpbGUgY2hhbm5lbHMgYW5kIGZvcm1hdFxuICAgIGlmICghaGFzQ2hhbm5lbHMgJiYgaGFzRm9ybWF0KSB7XG4gICAgICBmbGFncy5jaGFubmVscyA9IEZPUk1BVF9DSEFOTkVMU1tmbGFncy5mb3JtYXRdXG4gICAgfSBlbHNlIGlmIChoYXNDaGFubmVscyAmJiAhaGFzRm9ybWF0KSB7XG4gICAgICBpZiAoZmxhZ3MuY2hhbm5lbHMgIT09IENIQU5ORUxTX0ZPUk1BVFtmbGFncy5mb3JtYXRdKSB7XG4gICAgICAgIGZsYWdzLmZvcm1hdCA9IGZsYWdzLmludGVybmFsZm9ybWF0ID0gQ0hBTk5FTFNfRk9STUFUW2ZsYWdzLmNoYW5uZWxzXVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaGFzRm9ybWF0ICYmIGhhc0NoYW5uZWxzKSB7XG4gICAgICBcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRGbGFncyAoZmxhZ3MpIHtcbiAgICBnbC5waXhlbFN0b3JlaShHTF9VTlBBQ0tfRkxJUF9ZX1dFQkdMLCBmbGFncy5mbGlwWSlcbiAgICBnbC5waXhlbFN0b3JlaShHTF9VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIGZsYWdzLnByZW11bHRpcGx5QWxwaGEpXG4gICAgZ2wucGl4ZWxTdG9yZWkoR0xfVU5QQUNLX0NPTE9SU1BBQ0VfQ09OVkVSU0lPTl9XRUJHTCwgZmxhZ3MuY29sb3JTcGFjZSlcbiAgICBnbC5waXhlbFN0b3JlaShHTF9VTlBBQ0tfQUxJR05NRU5ULCBmbGFncy51bnBhY2tBbGlnbm1lbnQpXG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFRleCBpbWFnZSBkYXRhXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZnVuY3Rpb24gVGV4SW1hZ2UgKCkge1xuICAgIFRleEZsYWdzLmNhbGwodGhpcylcblxuICAgIHRoaXMueE9mZnNldCA9IDBcbiAgICB0aGlzLnlPZmZzZXQgPSAwXG5cbiAgICAvLyBkYXRhXG4gICAgdGhpcy5kYXRhID0gbnVsbFxuICAgIHRoaXMubmVlZHNGcmVlID0gZmFsc2VcblxuICAgIC8vIGh0bWwgZWxlbWVudFxuICAgIHRoaXMuZWxlbWVudCA9IG51bGxcblxuICAgIC8vIGNvcHlUZXhJbWFnZSBpbmZvXG4gICAgdGhpcy5uZWVkc0NvcHkgPSBmYWxzZVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VJbWFnZSAoaW1hZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgZGF0YSA9IG51bGxcbiAgICBpZiAoaXNQaXhlbERhdGEob3B0aW9ucykpIHtcbiAgICAgIGRhdGEgPSBvcHRpb25zXG4gICAgfSBlbHNlIGlmIChvcHRpb25zKSB7XG4gICAgICBcbiAgICAgIHBhcnNlRmxhZ3MoaW1hZ2UsIG9wdGlvbnMpXG4gICAgICBpZiAoJ3gnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgaW1hZ2UueE9mZnNldCA9IG9wdGlvbnMueCB8IDBcbiAgICAgIH1cbiAgICAgIGlmICgneScgaW4gb3B0aW9ucykge1xuICAgICAgICBpbWFnZS55T2Zmc2V0ID0gb3B0aW9ucy55IHwgMFxuICAgICAgfVxuICAgICAgaWYgKGlzUGl4ZWxEYXRhKG9wdGlvbnMuZGF0YSkpIHtcbiAgICAgICAgZGF0YSA9IG9wdGlvbnMuZGF0YVxuICAgICAgfVxuICAgIH1cblxuICAgIFxuXG4gICAgaWYgKG9wdGlvbnMuY29weSkge1xuICAgICAgXG4gICAgICB2YXIgdmlld1cgPSBjb250ZXh0U3RhdGUudmlld3BvcnRXaWR0aFxuICAgICAgdmFyIHZpZXdIID0gY29udGV4dFN0YXRlLnZpZXdwb3J0SGVpZ2h0XG4gICAgICBpbWFnZS53aWR0aCA9IGltYWdlLndpZHRoIHx8ICh2aWV3VyAtIGltYWdlLnhPZmZzZXQpXG4gICAgICBpbWFnZS5oZWlnaHQgPSBpbWFnZS5oZWlnaHQgfHwgKHZpZXdIIC0gaW1hZ2UueU9mZnNldClcbiAgICAgIGltYWdlLm5lZWRzQ29weSA9IHRydWVcbiAgICAgIFxuICAgIH0gZWxzZSBpZiAoIWRhdGEpIHtcbiAgICAgIGltYWdlLndpZHRoID0gaW1hZ2Uud2lkdGggfHwgMVxuICAgICAgaW1hZ2UuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0IHx8IDFcbiAgICB9IGVsc2UgaWYgKGlzVHlwZWRBcnJheShkYXRhKSkge1xuICAgICAgaW1hZ2UuZGF0YSA9IGRhdGFcbiAgICAgIGlmICghKCd0eXBlJyBpbiBvcHRpb25zKSAmJiBpbWFnZS50eXBlID09PSBHTF9VTlNJR05FRF9CWVRFKSB7XG4gICAgICAgIGltYWdlLnR5cGUgPSB0eXBlZEFycmF5Q29kZShkYXRhKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNOdW1lcmljQXJyYXkoZGF0YSkpIHtcbiAgICAgIGNvbnZlcnREYXRhKGltYWdlLCBkYXRhKVxuICAgICAgaW1hZ2UuYWxpZ25tZW50ID0gMVxuICAgICAgaW1hZ2UubmVlZHNGcmVlID0gdHJ1ZVxuICAgIH0gZWxzZSBpZiAoaXNOREFycmF5TGlrZShkYXRhKSkge1xuICAgICAgdmFyIGFycmF5ID0gZGF0YS5kYXRhXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJyYXkpICYmIGltYWdlLnR5cGUgPT09IEdMX1VOU0lHTkVEX0JZVEUpIHtcbiAgICAgICAgaW1hZ2UudHlwZSA9IHR5cGVkQXJyYXlDb2RlKGFycmF5KVxuICAgICAgfVxuICAgICAgdmFyIHNoYXBlID0gZGF0YS5zaGFwZVxuICAgICAgdmFyIHN0cmlkZSA9IGRhdGEuc3RyaWRlXG4gICAgICB2YXIgc2hhcGVYLCBzaGFwZVksIHNoYXBlQywgc3RyaWRlWCwgc3RyaWRlWSwgc3RyaWRlQ1xuICAgICAgaWYgKHNoYXBlLmxlbmd0aCA9PT0gMykge1xuICAgICAgICBzaGFwZUMgPSBzaGFwZVsyXVxuICAgICAgICBzdHJpZGVDID0gc3RyaWRlWzJdXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBcbiAgICAgICAgc2hhcGVDID0gMVxuICAgICAgICBzdHJpZGVDID0gMVxuICAgICAgfVxuICAgICAgc2hhcGVYID0gc2hhcGVbMF1cbiAgICAgIHNoYXBlWSA9IHNoYXBlWzFdXG4gICAgICBzdHJpZGVYID0gc3RyaWRlWzBdXG4gICAgICBzdHJpZGVZID0gc3RyaWRlWzFdXG4gICAgICBpbWFnZS5hbGlnbm1lbnQgPSAxXG4gICAgICBpbWFnZS53aWR0aCA9IHNoYXBlWFxuICAgICAgaW1hZ2UuaGVpZ2h0ID0gc2hhcGVZXG4gICAgICBpbWFnZS5jaGFubmVscyA9IHNoYXBlQ1xuICAgICAgaW1hZ2UuZm9ybWF0ID0gaW1hZ2UuaW50ZXJuYWxmb3JtYXQgPSBDSEFOTkVMU19GT1JNQVRbc2hhcGVDXVxuICAgICAgaW1hZ2UubmVlZHNGcmVlID0gdHJ1ZVxuICAgICAgdHJhbnNwb3NlRGF0YShpbWFnZSwgYXJyYXksIHN0cmlkZVgsIHN0cmlkZVksIHN0cmlkZUMsIGRhdGEub2Zmc2V0KVxuICAgIH0gZWxzZSBpZiAoaXNDYW52YXNFbGVtZW50KGRhdGEpIHx8IGlzQ29udGV4dDJEKGRhdGEpKSB7XG4gICAgICBpZiAoaXNDYW52YXNFbGVtZW50KGRhdGEpKSB7XG4gICAgICAgIGltYWdlLmVsZW1lbnQgPSBkYXRhXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbWFnZS5lbGVtZW50ID0gZGF0YS5jYW52YXNcbiAgICAgIH1cbiAgICAgIGltYWdlLndpZHRoID0gaW1hZ2UuZWxlbWVudC53aWR0aFxuICAgICAgaW1hZ2UuaGVpZ2h0ID0gaW1hZ2UuZWxlbWVudC5oZWlnaHRcbiAgICB9IGVsc2UgaWYgKGlzSW1hZ2VFbGVtZW50KGRhdGEpKSB7XG4gICAgICBpbWFnZS5lbGVtZW50ID0gZGF0YVxuICAgICAgaW1hZ2Uud2lkdGggPSBkYXRhLm5hdHVyYWxXaWR0aFxuICAgICAgaW1hZ2UuaGVpZ2h0ID0gZGF0YS5uYXR1cmFsSGVpZ2h0XG4gICAgfSBlbHNlIGlmIChpc1ZpZGVvRWxlbWVudChkYXRhKSkge1xuICAgICAgaW1hZ2UuZWxlbWVudCA9IGRhdGFcbiAgICAgIGltYWdlLndpZHRoID0gZGF0YS52aWRlb1dpZHRoXG4gICAgICBpbWFnZS5oZWlnaHQgPSBkYXRhLnZpZGVvSGVpZ2h0XG4gICAgICBpbWFnZS5uZWVkc1BvbGwgPSB0cnVlXG4gICAgfSBlbHNlIGlmIChpc1JlY3RBcnJheShkYXRhKSkge1xuICAgICAgdmFyIHcgPSBkYXRhWzBdLmxlbmd0aFxuICAgICAgdmFyIGggPSBkYXRhLmxlbmd0aFxuICAgICAgdmFyIGMgPSAxXG4gICAgICBpZiAoaXNBcnJheUxpa2UoZGF0YVswXVswXSkpIHtcbiAgICAgICAgYyA9IGRhdGFbMF1bMF0ubGVuZ3RoXG4gICAgICAgIGZsYXR0ZW4zRERhdGEoaW1hZ2UsIGRhdGEsIHcsIGgsIGMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbGF0dGVuMkREYXRhKGltYWdlLCBkYXRhLCB3LCBoKVxuICAgICAgfVxuICAgICAgaW1hZ2UuYWxpZ25tZW50ID0gMVxuICAgICAgaW1hZ2Uud2lkdGggPSB3XG4gICAgICBpbWFnZS5oZWlnaHQgPSBoXG4gICAgICBpbWFnZS5jaGFubmVscyA9IGNcbiAgICAgIGltYWdlLmZvcm1hdCA9IGltYWdlLmludGVybmFsZm9ybWF0ID0gQ0hBTk5FTFNfRk9STUFUW2NdXG4gICAgICBpbWFnZS5uZWVkc0ZyZWUgPSB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGltYWdlLnR5cGUgPT09IEdMX0ZMT0FUKSB7XG4gICAgICBcbiAgICB9IGVsc2UgaWYgKGltYWdlLnR5cGUgPT09IEdMX0hBTEZfRkxPQVRfT0VTKSB7XG4gICAgICBcbiAgICB9XG5cbiAgICAvLyBkbyBjb21wcmVzc2VkIHRleHR1cmUgIHZhbGlkYXRpb24gaGVyZS5cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEltYWdlIChpbmZvLCB0YXJnZXQsIG1pcGxldmVsKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBpbmZvLmVsZW1lbnRcbiAgICB2YXIgZGF0YSA9IGluZm8uZGF0YVxuICAgIHZhciBpbnRlcm5hbGZvcm1hdCA9IGluZm8uaW50ZXJuYWxmb3JtYXRcbiAgICB2YXIgZm9ybWF0ID0gaW5mby5mb3JtYXRcbiAgICB2YXIgdHlwZSA9IGluZm8udHlwZVxuICAgIHZhciB3aWR0aCA9IGluZm8ud2lkdGhcbiAgICB2YXIgaGVpZ2h0ID0gaW5mby5oZWlnaHRcblxuICAgIHNldEZsYWdzKGluZm8pXG5cbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIG1pcGxldmVsLCBmb3JtYXQsIGZvcm1hdCwgdHlwZSwgZWxlbWVudClcbiAgICB9IGVsc2UgaWYgKGluZm8uY29tcHJlc3NlZCkge1xuICAgICAgZ2wuY29tcHJlc3NlZFRleEltYWdlMkQodGFyZ2V0LCBtaXBsZXZlbCwgaW50ZXJuYWxmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIDAsIGRhdGEpXG4gICAgfSBlbHNlIGlmIChpbmZvLm5lZWRzQ29weSkge1xuICAgICAgcmVnbFBvbGwoKVxuICAgICAgZ2wuY29weVRleEltYWdlMkQoXG4gICAgICAgIHRhcmdldCwgbWlwbGV2ZWwsIGZvcm1hdCwgaW5mby54T2Zmc2V0LCBpbmZvLnlPZmZzZXQsIHdpZHRoLCBoZWlnaHQsIDApXG4gICAgfSBlbHNlIHtcbiAgICAgIGdsLnRleEltYWdlMkQoXG4gICAgICAgIHRhcmdldCwgbWlwbGV2ZWwsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgMCwgZm9ybWF0LCB0eXBlLCBkYXRhKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFN1YkltYWdlIChpbmZvLCB0YXJnZXQsIHgsIHksIG1pcGxldmVsKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBpbmZvLmVsZW1lbnRcbiAgICB2YXIgZGF0YSA9IGluZm8uZGF0YVxuICAgIHZhciBpbnRlcm5hbGZvcm1hdCA9IGluZm8uaW50ZXJuYWxmb3JtYXRcbiAgICB2YXIgZm9ybWF0ID0gaW5mby5mb3JtYXRcbiAgICB2YXIgdHlwZSA9IGluZm8udHlwZVxuICAgIHZhciB3aWR0aCA9IGluZm8ud2lkdGhcbiAgICB2YXIgaGVpZ2h0ID0gaW5mby5oZWlnaHRcblxuICAgIHNldEZsYWdzKGluZm8pXG5cbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgZ2wudGV4U3ViSW1hZ2UyRChcbiAgICAgICAgdGFyZ2V0LCBtaXBsZXZlbCwgeCwgeSwgZm9ybWF0LCB0eXBlLCBlbGVtZW50KVxuICAgIH0gZWxzZSBpZiAoaW5mby5jb21wcmVzc2VkKSB7XG4gICAgICBnbC5jb21wcmVzc2VkVGV4U3ViSW1hZ2UyRChcbiAgICAgICAgdGFyZ2V0LCBtaXBsZXZlbCwgeCwgeSwgaW50ZXJuYWxmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIGRhdGEpXG4gICAgfSBlbHNlIGlmIChpbmZvLm5lZWRzQ29weSkge1xuICAgICAgcmVnbFBvbGwoKVxuICAgICAgZ2wuY29weVRleFN1YkltYWdlMkQoXG4gICAgICAgIHRhcmdldCwgbWlwbGV2ZWwsIHgsIHksIGluZm8ueE9mZnNldCwgaW5mby55T2Zmc2V0LCB3aWR0aCwgaGVpZ2h0KVxuICAgIH0gZWxzZSB7XG4gICAgICBnbC50ZXhTdWJJbWFnZTJEKFxuICAgICAgICB0YXJnZXQsIG1pcGxldmVsLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBmb3JtYXQsIHR5cGUsIGRhdGEpXG4gICAgfVxuICB9XG5cbiAgLy8gdGV4SW1hZ2UgcG9vbFxuICB2YXIgaW1hZ2VQb29sID0gW11cblxuICBmdW5jdGlvbiBhbGxvY0ltYWdlICgpIHtcbiAgICByZXR1cm4gaW1hZ2VQb29sLnBvcCgpIHx8IG5ldyBUZXhJbWFnZSgpXG4gIH1cblxuICBmdW5jdGlvbiBmcmVlSW1hZ2UgKGltYWdlKSB7XG4gICAgaWYgKGltYWdlLm5lZWRzRnJlZSkge1xuICAgICAgcG9vbC5mcmVlVHlwZShpbWFnZS5kYXRhKVxuICAgIH1cbiAgICBUZXhJbWFnZS5jYWxsKGltYWdlKVxuICAgIGltYWdlUG9vbC5wdXNoKGltYWdlKVxuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBNaXAgbWFwXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZnVuY3Rpb24gTWlwTWFwICgpIHtcbiAgICBUZXhGbGFncy5jYWxsKHRoaXMpXG5cbiAgICB0aGlzLmdlbk1pcG1hcHMgPSBmYWxzZVxuICAgIHRoaXMubWlwbWFwSGludCA9IEdMX0RPTlRfQ0FSRVxuICAgIHRoaXMubWlwbWFzayA9IDBcbiAgICB0aGlzLmltYWdlcyA9IEFycmF5KDE2KVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VNaXBNYXBGcm9tU2hhcGUgKG1pcG1hcCwgd2lkdGgsIGhlaWdodCkge1xuICAgIHZhciBpbWcgPSBtaXBtYXAuaW1hZ2VzWzBdID0gYWxsb2NJbWFnZSgpXG4gICAgbWlwbWFwLm1pcG1hc2sgPSAxXG4gICAgaW1nLndpZHRoID0gbWlwbWFwLndpZHRoID0gd2lkdGhcbiAgICBpbWcuaGVpZ2h0ID0gbWlwbWFwLmhlaWdodCA9IGhlaWdodFxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VNaXBNYXBGcm9tT2JqZWN0IChtaXBtYXAsIG9wdGlvbnMpIHtcbiAgICB2YXIgaW1nRGF0YSA9IG51bGxcbiAgICBpZiAoaXNQaXhlbERhdGEob3B0aW9ucykpIHtcbiAgICAgIGltZ0RhdGEgPSBtaXBtYXAuaW1hZ2VzWzBdID0gYWxsb2NJbWFnZSgpXG4gICAgICBjb3B5RmxhZ3MoaW1nRGF0YSwgbWlwbWFwKVxuICAgICAgcGFyc2VJbWFnZShpbWdEYXRhLCBvcHRpb25zKVxuICAgICAgbWlwbWFwLm1pcG1hc2sgPSAxXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnNlRmxhZ3MobWlwbWFwLCBvcHRpb25zKVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucy5taXBtYXApKSB7XG4gICAgICAgIHZhciBtaXBEYXRhID0gb3B0aW9ucy5taXBtYXBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtaXBEYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgaW1nRGF0YSA9IG1pcG1hcC5pbWFnZXNbaV0gPSBhbGxvY0ltYWdlKClcbiAgICAgICAgICBjb3B5RmxhZ3MoaW1nRGF0YSwgbWlwbWFwKVxuICAgICAgICAgIGltZ0RhdGEud2lkdGggPj49IGlcbiAgICAgICAgICBpbWdEYXRhLmhlaWdodCA+Pj0gaVxuICAgICAgICAgIHBhcnNlSW1hZ2UoaW1nRGF0YSwgbWlwRGF0YVtpXSlcbiAgICAgICAgICBtaXBtYXAubWlwbWFzayB8PSAoMSA8PCBpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbWdEYXRhID0gbWlwbWFwLmltYWdlc1swXSA9IGFsbG9jSW1hZ2UoKVxuICAgICAgICBjb3B5RmxhZ3MoaW1nRGF0YSwgbWlwbWFwKVxuICAgICAgICBwYXJzZUltYWdlKGltZ0RhdGEsIG9wdGlvbnMpXG4gICAgICAgIG1pcG1hcC5taXBtYXNrID0gMVxuICAgICAgfVxuICAgIH1cbiAgICBjb3B5RmxhZ3MobWlwbWFwLCBtaXBtYXAuaW1hZ2VzWzBdKVxuXG4gICAgLy8gRm9yIHRleHR1cmVzIG9mIHRoZSBjb21wcmVzc2VkIGZvcm1hdCBXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfczN0Y1xuICAgIC8vIHdlIG11c3QgaGF2ZSB0aGF0XG4gICAgLy9cbiAgICAvLyBcIldoZW4gbGV2ZWwgZXF1YWxzIHplcm8gd2lkdGggYW5kIGhlaWdodCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNC5cbiAgICAvLyBXaGVuIGxldmVsIGlzIGdyZWF0ZXIgdGhhbiAwIHdpZHRoIGFuZCBoZWlnaHQgbXVzdCBiZSAwLCAxLCAyIG9yIGEgbXVsdGlwbGUgb2YgNC4gXCJcbiAgICAvL1xuICAgIC8vIGJ1dCB3ZSBkbyBub3QgeWV0IHN1cHBvcnQgaGF2aW5nIG11bHRpcGxlIG1pcG1hcCBsZXZlbHMgZm9yIGNvbXByZXNzZWQgdGV4dHVyZXMsXG4gICAgLy8gc28gd2Ugb25seSB0ZXN0IGZvciBsZXZlbCB6ZXJvLlxuXG4gICAgaWYgKG1pcG1hcC5jb21wcmVzc2VkICYmXG4gICAgICAgIChtaXBtYXAuaW50ZXJuYWxmb3JtYXQgPT09IEdMX0NPTVBSRVNTRURfUkdCX1MzVENfRFhUMV9FWFQpIHx8XG4gICAgICAgIChtaXBtYXAuaW50ZXJuYWxmb3JtYXQgPT09IEdMX0NPTVBSRVNTRURfUkdCQV9TM1RDX0RYVDFfRVhUKSB8fFxuICAgICAgICAobWlwbWFwLmludGVybmFsZm9ybWF0ID09PSBHTF9DT01QUkVTU0VEX1JHQkFfUzNUQ19EWFQzX0VYVCkgfHxcbiAgICAgICAgKG1pcG1hcC5pbnRlcm5hbGZvcm1hdCA9PT0gR0xfQ09NUFJFU1NFRF9SR0JBX1MzVENfRFhUNV9FWFQpKSB7XG4gICAgICBcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRNaXBNYXAgKG1pcG1hcCwgdGFyZ2V0KSB7XG4gICAgdmFyIGltYWdlcyA9IG1pcG1hcC5pbWFnZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKCFpbWFnZXNbaV0pIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBzZXRJbWFnZShpbWFnZXNbaV0sIHRhcmdldCwgaSlcbiAgICB9XG4gIH1cblxuICB2YXIgbWlwUG9vbCA9IFtdXG5cbiAgZnVuY3Rpb24gYWxsb2NNaXBNYXAgKCkge1xuICAgIHZhciByZXN1bHQgPSBtaXBQb29sLnBvcCgpIHx8IG5ldyBNaXBNYXAoKVxuICAgIFRleEZsYWdzLmNhbGwocmVzdWx0KVxuICAgIHJlc3VsdC5taXBtYXNrID0gMFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgICAgcmVzdWx0LmltYWdlc1tpXSA9IG51bGxcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgZnVuY3Rpb24gZnJlZU1pcE1hcCAobWlwbWFwKSB7XG4gICAgdmFyIGltYWdlcyA9IG1pcG1hcC5pbWFnZXNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGltYWdlc1tpXSkge1xuICAgICAgICBmcmVlSW1hZ2UoaW1hZ2VzW2ldKVxuICAgICAgfVxuICAgICAgaW1hZ2VzW2ldID0gbnVsbFxuICAgIH1cbiAgICBtaXBQb29sLnB1c2gobWlwbWFwKVxuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBUZXggaW5mb1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGZ1bmN0aW9uIFRleEluZm8gKCkge1xuICAgIHRoaXMubWluRmlsdGVyID0gR0xfTkVBUkVTVFxuICAgIHRoaXMubWFnRmlsdGVyID0gR0xfTkVBUkVTVFxuXG4gICAgdGhpcy53cmFwUyA9IEdMX0NMQU1QX1RPX0VER0VcbiAgICB0aGlzLndyYXBUID0gR0xfQ0xBTVBfVE9fRURHRVxuXG4gICAgdGhpcy5hbmlzb3Ryb3BpYyA9IDFcblxuICAgIHRoaXMuZ2VuTWlwbWFwcyA9IGZhbHNlXG4gICAgdGhpcy5taXBtYXBIaW50ID0gR0xfRE9OVF9DQVJFXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVRleEluZm8gKGluZm8sIG9wdGlvbnMpIHtcbiAgICBpZiAoJ21pbicgaW4gb3B0aW9ucykge1xuICAgICAgdmFyIG1pbkZpbHRlciA9IG9wdGlvbnMubWluXG4gICAgICBcbiAgICAgIGluZm8ubWluRmlsdGVyID0gbWluRmlsdGVyc1ttaW5GaWx0ZXJdXG4gICAgICBpZiAoTUlQTUFQX0ZJTFRFUlMuaW5kZXhPZihpbmZvLm1pbkZpbHRlcikgPj0gMCkge1xuICAgICAgICBpbmZvLmdlbk1pcG1hcHMgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCdtYWcnIGluIG9wdGlvbnMpIHtcbiAgICAgIHZhciBtYWdGaWx0ZXIgPSBvcHRpb25zLm1hZ1xuICAgICAgXG4gICAgICBpbmZvLm1hZ0ZpbHRlciA9IG1hZ0ZpbHRlcnNbbWFnRmlsdGVyXVxuICAgIH1cblxuICAgIHZhciB3cmFwUyA9IGluZm8ud3JhcFNcbiAgICB2YXIgd3JhcFQgPSBpbmZvLndyYXBUXG4gICAgaWYgKCd3cmFwJyBpbiBvcHRpb25zKSB7XG4gICAgICB2YXIgd3JhcCA9IG9wdGlvbnMud3JhcFxuICAgICAgaWYgKHR5cGVvZiB3cmFwID09PSAnc3RyaW5nJykge1xuICAgICAgICBcbiAgICAgICAgd3JhcFMgPSB3cmFwVCA9IHdyYXBNb2Rlc1t3cmFwXVxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHdyYXApKSB7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgd3JhcFMgPSB3cmFwTW9kZXNbd3JhcFswXV1cbiAgICAgICAgd3JhcFQgPSB3cmFwTW9kZXNbd3JhcFsxXV1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCd3cmFwUycgaW4gb3B0aW9ucykge1xuICAgICAgICB2YXIgb3B0V3JhcFMgPSBvcHRpb25zLndyYXBTXG4gICAgICAgIFxuICAgICAgICB3cmFwUyA9IHdyYXBNb2Rlc1tvcHRXcmFwU11cbiAgICAgIH1cbiAgICAgIGlmICgnd3JhcFQnIGluIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdFdyYXBUID0gb3B0aW9ucy53cmFwVFxuICAgICAgICBcbiAgICAgICAgd3JhcFQgPSB3cmFwTW9kZXNbb3B0V3JhcFRdXG4gICAgICB9XG4gICAgfVxuICAgIGluZm8ud3JhcFMgPSB3cmFwU1xuICAgIGluZm8ud3JhcFQgPSB3cmFwVFxuXG4gICAgaWYgKCdhbmlzb3Ryb3BpYycgaW4gb3B0aW9ucykge1xuICAgICAgdmFyIGFuaXNvdHJvcGljID0gb3B0aW9ucy5hbmlzb3Ryb3BpY1xuICAgICAgXG4gICAgICBpbmZvLmFuaXNvdHJvcGljID0gb3B0aW9ucy5hbmlzb3Ryb3BpY1xuICAgIH1cblxuICAgIGlmICgnbWlwbWFwJyBpbiBvcHRpb25zKSB7XG4gICAgICB2YXIgaGFzTWlwTWFwID0gZmFsc2VcbiAgICAgIHN3aXRjaCAodHlwZW9mIG9wdGlvbnMubWlwbWFwKSB7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgXG4gICAgICAgICAgaW5mby5taXBtYXBIaW50ID0gbWlwbWFwSGludFtvcHRpb25zLm1pcG1hcF1cbiAgICAgICAgICBpbmZvLmdlbk1pcG1hcHMgPSB0cnVlXG4gICAgICAgICAgaGFzTWlwTWFwID0gdHJ1ZVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgaGFzTWlwTWFwID0gaW5mby5nZW5NaXBtYXBzID0gb3B0aW9ucy5taXBtYXBcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgXG4gICAgICAgICAgaW5mby5nZW5NaXBtYXBzID0gZmFsc2VcbiAgICAgICAgICBoYXNNaXBNYXAgPSB0cnVlXG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIFxuICAgICAgfVxuICAgICAgaWYgKGhhc01pcE1hcCAmJiAhKCdtaW4nIGluIG9wdGlvbnMpKSB7XG4gICAgICAgIGluZm8ubWluRmlsdGVyID0gR0xfTkVBUkVTVF9NSVBNQVBfTkVBUkVTVFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFRleEluZm8gKGluZm8sIHRhcmdldCkge1xuICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBHTF9URVhUVVJFX01JTl9GSUxURVIsIGluZm8ubWluRmlsdGVyKVxuICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBHTF9URVhUVVJFX01BR19GSUxURVIsIGluZm8ubWFnRmlsdGVyKVxuICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBHTF9URVhUVVJFX1dSQVBfUywgaW5mby53cmFwUylcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgR0xfVEVYVFVSRV9XUkFQX1QsIGluZm8ud3JhcFQpXG4gICAgaWYgKGV4dGVuc2lvbnMuZXh0X3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljKSB7XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgR0xfVEVYVFVSRV9NQVhfQU5JU09UUk9QWV9FWFQsIGluZm8uYW5pc290cm9waWMpXG4gICAgfVxuICAgIGlmIChpbmZvLmdlbk1pcG1hcHMpIHtcbiAgICAgIGdsLmhpbnQoR0xfR0VORVJBVEVfTUlQTUFQX0hJTlQsIGluZm8ubWlwbWFwSGludClcbiAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKHRhcmdldClcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIEZ1bGwgdGV4dHVyZSBvYmplY3RcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB2YXIgdGV4dHVyZUNvdW50ID0gMFxuICB2YXIgdGV4dHVyZVNldCA9IHt9XG4gIHZhciBudW1UZXhVbml0cyA9IGxpbWl0cy5tYXhUZXh0dXJlVW5pdHNcbiAgdmFyIHRleHR1cmVVbml0cyA9IEFycmF5KG51bVRleFVuaXRzKS5tYXAoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBudWxsXG4gIH0pXG5cbiAgZnVuY3Rpb24gUkVHTFRleHR1cmUgKHRhcmdldCkge1xuICAgIFRleEZsYWdzLmNhbGwodGhpcylcbiAgICB0aGlzLm1pcG1hc2sgPSAwXG4gICAgdGhpcy5pbnRlcm5hbGZvcm1hdCA9IEdMX1JHQkFcblxuICAgIHRoaXMuaWQgPSB0ZXh0dXJlQ291bnQrK1xuXG4gICAgdGhpcy5yZWZDb3VudCA9IDFcblxuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy50ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpXG5cbiAgICB0aGlzLnVuaXQgPSAtMVxuICAgIHRoaXMuYmluZENvdW50ID0gMFxuXG4gICAgdGhpcy50ZXhJbmZvID0gbmV3IFRleEluZm8oKVxuXG4gICAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgICB0aGlzLnN0YXRzID0ge3NpemU6IDB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdGVtcEJpbmQgKHRleHR1cmUpIHtcbiAgICBnbC5hY3RpdmVUZXh0dXJlKEdMX1RFWFRVUkUwKVxuICAgIGdsLmJpbmRUZXh0dXJlKHRleHR1cmUudGFyZ2V0LCB0ZXh0dXJlLnRleHR1cmUpXG4gIH1cblxuICBmdW5jdGlvbiB0ZW1wUmVzdG9yZSAoKSB7XG4gICAgdmFyIHByZXYgPSB0ZXh0dXJlVW5pdHNbMF1cbiAgICBpZiAocHJldikge1xuICAgICAgZ2wuYmluZFRleHR1cmUocHJldi50YXJnZXQsIHByZXYudGV4dHVyZSlcbiAgICB9IGVsc2Uge1xuICAgICAgZ2wuYmluZFRleHR1cmUoR0xfVEVYVFVSRV8yRCwgbnVsbClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95ICh0ZXh0dXJlKSB7XG4gICAgdmFyIGhhbmRsZSA9IHRleHR1cmUudGV4dHVyZVxuICAgIFxuICAgIHZhciB1bml0ID0gdGV4dHVyZS51bml0XG4gICAgdmFyIHRhcmdldCA9IHRleHR1cmUudGFyZ2V0XG4gICAgaWYgKHVuaXQgPj0gMCkge1xuICAgICAgZ2wuYWN0aXZlVGV4dHVyZShHTF9URVhUVVJFMCArIHVuaXQpXG4gICAgICBnbC5iaW5kVGV4dHVyZSh0YXJnZXQsIG51bGwpXG4gICAgICB0ZXh0dXJlVW5pdHNbdW5pdF0gPSBudWxsXG4gICAgfVxuICAgIGdsLmRlbGV0ZVRleHR1cmUoaGFuZGxlKVxuICAgIHRleHR1cmUudGV4dHVyZSA9IG51bGxcbiAgICB0ZXh0dXJlLnBhcmFtcyA9IG51bGxcbiAgICB0ZXh0dXJlLnBpeGVscyA9IG51bGxcbiAgICB0ZXh0dXJlLnJlZkNvdW50ID0gMFxuICAgIGRlbGV0ZSB0ZXh0dXJlU2V0W3RleHR1cmUuaWRdXG4gICAgc3RhdHMudGV4dHVyZUNvdW50LS1cbiAgfVxuXG4gIGV4dGVuZChSRUdMVGV4dHVyZS5wcm90b3R5cGUsIHtcbiAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdGV4dHVyZSA9IHRoaXNcbiAgICAgIHRleHR1cmUuYmluZENvdW50ICs9IDFcbiAgICAgIHZhciB1bml0ID0gdGV4dHVyZS51bml0XG4gICAgICBpZiAodW5pdCA8IDApIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1UZXhVbml0czsgKytpKSB7XG4gICAgICAgICAgdmFyIG90aGVyID0gdGV4dHVyZVVuaXRzW2ldXG4gICAgICAgICAgaWYgKG90aGVyKSB7XG4gICAgICAgICAgICBpZiAob3RoZXIuYmluZENvdW50ID4gMCkge1xuICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3RoZXIudW5pdCA9IC0xXG4gICAgICAgICAgfVxuICAgICAgICAgIHRleHR1cmVVbml0c1tpXSA9IHRleHR1cmVcbiAgICAgICAgICB1bml0ID0gaVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVuaXQgPj0gbnVtVGV4VW5pdHMpIHtcbiAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29uZmlnLnByb2ZpbGUgJiYgc3RhdHMubWF4VGV4dHVyZVVuaXRzIDwgKHVuaXQgKyAxKSkge1xuICAgICAgICAgIHN0YXRzLm1heFRleHR1cmVVbml0cyA9IHVuaXQgKyAxIC8vICsxLCBzaW5jZSB0aGUgdW5pdHMgYXJlIHplcm8tYmFzZWRcbiAgICAgICAgfVxuICAgICAgICB0ZXh0dXJlLnVuaXQgPSB1bml0XG4gICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoR0xfVEVYVFVSRTAgKyB1bml0KVxuICAgICAgICBnbC5iaW5kVGV4dHVyZSh0ZXh0dXJlLnRhcmdldCwgdGV4dHVyZS50ZXh0dXJlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHVuaXRcbiAgICB9LFxuXG4gICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmJpbmRDb3VudCAtPSAxXG4gICAgfSxcblxuICAgIGRlY1JlZjogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKC0tdGhpcy5yZWZDb3VudCA8PSAwKSB7XG4gICAgICAgIGRlc3Ryb3kodGhpcylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgZnVuY3Rpb24gY3JlYXRlVGV4dHVyZTJEIChhLCBiKSB7XG4gICAgdmFyIHRleHR1cmUgPSBuZXcgUkVHTFRleHR1cmUoR0xfVEVYVFVSRV8yRClcbiAgICB0ZXh0dXJlU2V0W3RleHR1cmUuaWRdID0gdGV4dHVyZVxuICAgIHN0YXRzLnRleHR1cmVDb3VudCsrXG5cbiAgICBmdW5jdGlvbiByZWdsVGV4dHVyZTJEIChhLCBiKSB7XG4gICAgICB2YXIgdGV4SW5mbyA9IHRleHR1cmUudGV4SW5mb1xuICAgICAgVGV4SW5mby5jYWxsKHRleEluZm8pXG4gICAgICB2YXIgbWlwRGF0YSA9IGFsbG9jTWlwTWFwKClcblxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAodHlwZW9mIGIgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgcGFyc2VNaXBNYXBGcm9tU2hhcGUobWlwRGF0YSwgYSB8IDAsIGIgfCAwKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcnNlTWlwTWFwRnJvbVNoYXBlKG1pcERhdGEsIGEgfCAwLCBhIHwgMClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhKSB7XG4gICAgICAgIFxuICAgICAgICBwYXJzZVRleEluZm8odGV4SW5mbywgYSlcbiAgICAgICAgcGFyc2VNaXBNYXBGcm9tT2JqZWN0KG1pcERhdGEsIGEpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlbXB0eSB0ZXh0dXJlcyBnZXQgYXNzaWduZWQgYSBkZWZhdWx0IHNoYXBlIG9mIDF4MVxuICAgICAgICBwYXJzZU1pcE1hcEZyb21TaGFwZShtaXBEYXRhLCAxLCAxKVxuICAgICAgfVxuXG4gICAgICBpZiAodGV4SW5mby5nZW5NaXBtYXBzKSB7XG4gICAgICAgIG1pcERhdGEubWlwbWFzayA9IChtaXBEYXRhLndpZHRoIDw8IDEpIC0gMVxuICAgICAgfVxuICAgICAgdGV4dHVyZS5taXBtYXNrID0gbWlwRGF0YS5taXBtYXNrXG5cbiAgICAgIGNvcHlGbGFncyh0ZXh0dXJlLCBtaXBEYXRhKVxuXG4gICAgICBcbiAgICAgIHRleHR1cmUuaW50ZXJuYWxmb3JtYXQgPSBtaXBEYXRhLmludGVybmFsZm9ybWF0XG5cbiAgICAgIHJlZ2xUZXh0dXJlMkQud2lkdGggPSBtaXBEYXRhLndpZHRoXG4gICAgICByZWdsVGV4dHVyZTJELmhlaWdodCA9IG1pcERhdGEuaGVpZ2h0XG5cbiAgICAgIHRlbXBCaW5kKHRleHR1cmUpXG4gICAgICBzZXRNaXBNYXAobWlwRGF0YSwgR0xfVEVYVFVSRV8yRClcbiAgICAgIHNldFRleEluZm8odGV4SW5mbywgR0xfVEVYVFVSRV8yRClcbiAgICAgIHRlbXBSZXN0b3JlKClcblxuICAgICAgZnJlZU1pcE1hcChtaXBEYXRhKVxuXG4gICAgICBpZiAoY29uZmlnLnByb2ZpbGUpIHtcbiAgICAgICAgdGV4dHVyZS5zdGF0cy5zaXplID0gZ2V0VGV4dHVyZVNpemUoXG4gICAgICAgICAgdGV4dHVyZS5pbnRlcm5hbGZvcm1hdCxcbiAgICAgICAgICB0ZXh0dXJlLnR5cGUsXG4gICAgICAgICAgbWlwRGF0YS53aWR0aCxcbiAgICAgICAgICBtaXBEYXRhLmhlaWdodCxcbiAgICAgICAgICB0ZXhJbmZvLmdlbk1pcG1hcHMsXG4gICAgICAgICAgZmFsc2UpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZWdsVGV4dHVyZTJEXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3ViaW1hZ2UgKGltYWdlLCB4XywgeV8sIGxldmVsXykge1xuICAgICAgXG5cbiAgICAgIHZhciB4ID0geF8gfCAwXG4gICAgICB2YXIgeSA9IHlfIHwgMFxuICAgICAgdmFyIGxldmVsID0gbGV2ZWxfIHwgMFxuXG4gICAgICB2YXIgaW1hZ2VEYXRhID0gYWxsb2NJbWFnZSgpXG4gICAgICBjb3B5RmxhZ3MoaW1hZ2VEYXRhLCB0ZXh0dXJlKVxuICAgICAgaW1hZ2VEYXRhLndpZHRoID4+PSBsZXZlbFxuICAgICAgaW1hZ2VEYXRhLmhlaWdodCA+Pj0gbGV2ZWxcbiAgICAgIGltYWdlRGF0YS53aWR0aCAtPSB4XG4gICAgICBpbWFnZURhdGEuaGVpZ2h0IC09IHlcbiAgICAgIHBhcnNlSW1hZ2UoaW1hZ2VEYXRhLCBpbWFnZSlcblxuICAgICAgXG4gICAgICBcbiAgICAgIFxuICAgICAgXG5cbiAgICAgIHRlbXBCaW5kKHRleHR1cmUpXG4gICAgICBzZXRTdWJJbWFnZShpbWFnZURhdGEsIEdMX1RFWFRVUkVfMkQsIHgsIHksIGxldmVsKVxuICAgICAgdGVtcFJlc3RvcmUoKVxuXG4gICAgICBmcmVlSW1hZ2UoaW1hZ2VEYXRhKVxuXG4gICAgICByZXR1cm4gcmVnbFRleHR1cmUyRFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2l6ZSAod18sIGhfKSB7XG4gICAgICB2YXIgdyA9IHdfIHwgMFxuICAgICAgdmFyIGggPSAoaF8gfCAwKSB8fCB3XG4gICAgICBpZiAodyA9PT0gdGV4dHVyZS53aWR0aCAmJiBoID09PSB0ZXh0dXJlLmhlaWdodCkge1xuICAgICAgICByZXR1cm4gcmVnbFRleHR1cmUyRFxuICAgICAgfVxuXG4gICAgICByZWdsVGV4dHVyZTJELndpZHRoID0gdGV4dHVyZS53aWR0aCA9IHdcbiAgICAgIHJlZ2xUZXh0dXJlMkQuaGVpZ2h0ID0gdGV4dHVyZS5oZWlnaHQgPSBoXG5cbiAgICAgIHRlbXBCaW5kKHRleHR1cmUpXG4gICAgICBmb3IgKHZhciBpID0gMDsgdGV4dHVyZS5taXBtYXNrID4+IGk7ICsraSkge1xuICAgICAgICBnbC50ZXhJbWFnZTJEKFxuICAgICAgICAgIEdMX1RFWFRVUkVfMkQsXG4gICAgICAgICAgaSxcbiAgICAgICAgICB0ZXh0dXJlLmZvcm1hdCxcbiAgICAgICAgICB3ID4+IGksXG4gICAgICAgICAgaCA+PiBpLFxuICAgICAgICAgIDAsXG4gICAgICAgICAgdGV4dHVyZS5mb3JtYXQsXG4gICAgICAgICAgdGV4dHVyZS50eXBlLFxuICAgICAgICAgIG51bGwpXG4gICAgICB9XG4gICAgICB0ZW1wUmVzdG9yZSgpXG5cbiAgICAgIC8vIGFsc28sIHJlY29tcHV0ZSB0aGUgdGV4dHVyZSBzaXplLlxuICAgICAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgICAgIHRleHR1cmUuc3RhdHMuc2l6ZSA9IGdldFRleHR1cmVTaXplKFxuICAgICAgICAgIHRleHR1cmUuaW50ZXJuYWxmb3JtYXQsXG4gICAgICAgICAgdGV4dHVyZS50eXBlLFxuICAgICAgICAgIHcsXG4gICAgICAgICAgaCxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBmYWxzZSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlZ2xUZXh0dXJlMkRcbiAgICB9XG5cbiAgICByZWdsVGV4dHVyZTJEKGEsIGIpXG5cbiAgICByZWdsVGV4dHVyZTJELnN1YmltYWdlID0gc3ViaW1hZ2VcbiAgICByZWdsVGV4dHVyZTJELnJlc2l6ZSA9IHJlc2l6ZVxuICAgIHJlZ2xUZXh0dXJlMkQuX3JlZ2xUeXBlID0gJ3RleHR1cmUyZCdcbiAgICByZWdsVGV4dHVyZTJELl90ZXh0dXJlID0gdGV4dHVyZVxuICAgIGlmIChjb25maWcucHJvZmlsZSkge1xuICAgICAgcmVnbFRleHR1cmUyRC5zdGF0cyA9IHRleHR1cmUuc3RhdHNcbiAgICB9XG4gICAgcmVnbFRleHR1cmUyRC5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGV4dHVyZS5kZWNSZWYoKVxuICAgIH1cblxuICAgIHJldHVybiByZWdsVGV4dHVyZTJEXG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVUZXh0dXJlQ3ViZSAoYTAsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICAgIHZhciB0ZXh0dXJlID0gbmV3IFJFR0xUZXh0dXJlKEdMX1RFWFRVUkVfQ1VCRV9NQVApXG4gICAgdGV4dHVyZVNldFt0ZXh0dXJlLmlkXSA9IHRleHR1cmVcbiAgICBzdGF0cy5jdWJlQ291bnQrK1xuXG4gICAgdmFyIGZhY2VzID0gbmV3IEFycmF5KDYpXG5cbiAgICBmdW5jdGlvbiByZWdsVGV4dHVyZUN1YmUgKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgICAgIHZhciBpXG4gICAgICB2YXIgdGV4SW5mbyA9IHRleHR1cmUudGV4SW5mb1xuICAgICAgVGV4SW5mby5jYWxsKHRleEluZm8pXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICAgIGZhY2VzW2ldID0gYWxsb2NNaXBNYXAoKVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGEwID09PSAnbnVtYmVyJyB8fCAhYTApIHtcbiAgICAgICAgdmFyIHMgPSAoYTAgfCAwKSB8fCAxXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCA2OyArK2kpIHtcbiAgICAgICAgICBwYXJzZU1pcE1hcEZyb21TaGFwZShmYWNlc1tpXSwgcywgcylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYTAgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmIChhMSkge1xuICAgICAgICAgIHBhcnNlTWlwTWFwRnJvbU9iamVjdChmYWNlc1swXSwgYTApXG4gICAgICAgICAgcGFyc2VNaXBNYXBGcm9tT2JqZWN0KGZhY2VzWzFdLCBhMSlcbiAgICAgICAgICBwYXJzZU1pcE1hcEZyb21PYmplY3QoZmFjZXNbMl0sIGEyKVxuICAgICAgICAgIHBhcnNlTWlwTWFwRnJvbU9iamVjdChmYWNlc1szXSwgYTMpXG4gICAgICAgICAgcGFyc2VNaXBNYXBGcm9tT2JqZWN0KGZhY2VzWzRdLCBhNClcbiAgICAgICAgICBwYXJzZU1pcE1hcEZyb21PYmplY3QoZmFjZXNbNV0sIGE1KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcnNlVGV4SW5mbyh0ZXhJbmZvLCBhMClcbiAgICAgICAgICBwYXJzZUZsYWdzKHRleHR1cmUsIGEwKVxuICAgICAgICAgIGlmICgnZmFjZXMnIGluIGEwKSB7XG4gICAgICAgICAgICB2YXIgZmFjZV9pbnB1dCA9IGEwLmZhY2VzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA2OyArK2kpIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIGNvcHlGbGFncyhmYWNlc1tpXSwgdGV4dHVyZSlcbiAgICAgICAgICAgICAgcGFyc2VNaXBNYXBGcm9tT2JqZWN0KGZhY2VzW2ldLCBmYWNlX2lucHV0W2ldKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICAgICAgICAgIHBhcnNlTWlwTWFwRnJvbU9iamVjdChmYWNlc1tpXSwgYTApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBcbiAgICAgIH1cblxuICAgICAgY29weUZsYWdzKHRleHR1cmUsIGZhY2VzWzBdKVxuICAgICAgaWYgKHRleEluZm8uZ2VuTWlwbWFwcykge1xuICAgICAgICB0ZXh0dXJlLm1pcG1hc2sgPSAoZmFjZXNbMF0ud2lkdGggPDwgMSkgLSAxXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0dXJlLm1pcG1hc2sgPSBmYWNlc1swXS5taXBtYXNrXG4gICAgICB9XG5cbiAgICAgIFxuICAgICAgdGV4dHVyZS5pbnRlcm5hbGZvcm1hdCA9IGZhY2VzWzBdLmludGVybmFsZm9ybWF0XG5cbiAgICAgIHJlZ2xUZXh0dXJlQ3ViZS53aWR0aCA9IGZhY2VzWzBdLndpZHRoXG4gICAgICByZWdsVGV4dHVyZUN1YmUuaGVpZ2h0ID0gZmFjZXNbMF0uaGVpZ2h0XG5cbiAgICAgIHRlbXBCaW5kKHRleHR1cmUpXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICAgIHNldE1pcE1hcChmYWNlc1tpXSwgR0xfVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgaSlcbiAgICAgIH1cbiAgICAgIHNldFRleEluZm8odGV4SW5mbywgR0xfVEVYVFVSRV9DVUJFX01BUClcbiAgICAgIHRlbXBSZXN0b3JlKClcblxuICAgICAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgICAgIHRleHR1cmUuc3RhdHMuc2l6ZSA9IGdldFRleHR1cmVTaXplKFxuICAgICAgICAgIHRleHR1cmUuaW50ZXJuYWxmb3JtYXQsXG4gICAgICAgICAgdGV4dHVyZS50eXBlLFxuICAgICAgICAgIHJlZ2xUZXh0dXJlQ3ViZS53aWR0aCxcbiAgICAgICAgICByZWdsVGV4dHVyZUN1YmUuaGVpZ2h0LFxuICAgICAgICAgIHRleEluZm8uZ2VuTWlwbWFwcyxcbiAgICAgICAgICB0cnVlKVxuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICAgIGZyZWVNaXBNYXAoZmFjZXNbaV0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZWdsVGV4dHVyZUN1YmVcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdWJpbWFnZSAoZmFjZSwgaW1hZ2UsIHhfLCB5XywgbGV2ZWxfKSB7XG4gICAgICBcbiAgICAgIFxuXG4gICAgICB2YXIgeCA9IHhfIHwgMFxuICAgICAgdmFyIHkgPSB5XyB8IDBcbiAgICAgIHZhciBsZXZlbCA9IGxldmVsXyB8IDBcblxuICAgICAgdmFyIGltYWdlRGF0YSA9IGFsbG9jSW1hZ2UoKVxuICAgICAgY29weUZsYWdzKGltYWdlRGF0YSwgdGV4dHVyZSlcbiAgICAgIGltYWdlRGF0YS53aWR0aCA+Pj0gbGV2ZWxcbiAgICAgIGltYWdlRGF0YS5oZWlnaHQgPj49IGxldmVsXG4gICAgICBpbWFnZURhdGEud2lkdGggLT0geFxuICAgICAgaW1hZ2VEYXRhLmhlaWdodCAtPSB5XG4gICAgICBwYXJzZUltYWdlKGltYWdlRGF0YSwgaW1hZ2UpXG5cbiAgICAgIFxuICAgICAgXG4gICAgICBcbiAgICAgIFxuXG4gICAgICB0ZW1wQmluZCh0ZXh0dXJlKVxuICAgICAgc2V0U3ViSW1hZ2UoaW1hZ2VEYXRhLCBHTF9URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyBmYWNlLCB4LCB5LCBsZXZlbClcbiAgICAgIHRlbXBSZXN0b3JlKClcblxuICAgICAgZnJlZUltYWdlKGltYWdlRGF0YSlcblxuICAgICAgcmV0dXJuIHJlZ2xUZXh0dXJlQ3ViZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2l6ZSAocmFkaXVzXykge1xuICAgICAgdmFyIHJhZGl1cyA9IHJhZGl1c18gfCAwXG4gICAgICBpZiAocmFkaXVzID09PSB0ZXh0dXJlLndpZHRoKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICByZWdsVGV4dHVyZUN1YmUud2lkdGggPSB0ZXh0dXJlLndpZHRoID0gcmFkaXVzXG4gICAgICByZWdsVGV4dHVyZUN1YmUuaGVpZ2h0ID0gdGV4dHVyZS5oZWlnaHQgPSByYWRpdXNcblxuICAgICAgdGVtcEJpbmQodGV4dHVyZSlcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjsgKytpKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyB0ZXh0dXJlLm1pcG1hc2sgPj4gajsgKytqKSB7XG4gICAgICAgICAgZ2wudGV4SW1hZ2UyRChcbiAgICAgICAgICAgIEdMX1RFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCArIGksXG4gICAgICAgICAgICBqLFxuICAgICAgICAgICAgdGV4dHVyZS5mb3JtYXQsXG4gICAgICAgICAgICByYWRpdXMgPj4gaixcbiAgICAgICAgICAgIHJhZGl1cyA+PiBqLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHRleHR1cmUuZm9ybWF0LFxuICAgICAgICAgICAgdGV4dHVyZS50eXBlLFxuICAgICAgICAgICAgbnVsbClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGVtcFJlc3RvcmUoKVxuXG4gICAgICBpZiAoY29uZmlnLnByb2ZpbGUpIHtcbiAgICAgICAgdGV4dHVyZS5zdGF0cy5zaXplID0gZ2V0VGV4dHVyZVNpemUoXG4gICAgICAgICAgdGV4dHVyZS5pbnRlcm5hbGZvcm1hdCxcbiAgICAgICAgICB0ZXh0dXJlLnR5cGUsXG4gICAgICAgICAgcmVnbFRleHR1cmVDdWJlLndpZHRoLFxuICAgICAgICAgIHJlZ2xUZXh0dXJlQ3ViZS5oZWlnaHQsXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgdHJ1ZSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlZ2xUZXh0dXJlQ3ViZVxuICAgIH1cblxuICAgIHJlZ2xUZXh0dXJlQ3ViZShhMCwgYTEsIGEyLCBhMywgYTQsIGE1KVxuXG4gICAgcmVnbFRleHR1cmVDdWJlLnN1YmltYWdlID0gc3ViaW1hZ2VcbiAgICByZWdsVGV4dHVyZUN1YmUucmVzaXplID0gcmVzaXplXG4gICAgcmVnbFRleHR1cmVDdWJlLl9yZWdsVHlwZSA9ICd0ZXh0dXJlQ3ViZSdcbiAgICByZWdsVGV4dHVyZUN1YmUuX3RleHR1cmUgPSB0ZXh0dXJlXG4gICAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgICByZWdsVGV4dHVyZUN1YmUuc3RhdHMgPSB0ZXh0dXJlLnN0YXRzXG4gICAgfVxuICAgIHJlZ2xUZXh0dXJlQ3ViZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGV4dHVyZS5kZWNSZWYoKVxuICAgIH1cblxuICAgIHJldHVybiByZWdsVGV4dHVyZUN1YmVcbiAgfVxuXG4gIC8vIENhbGxlZCB3aGVuIHJlZ2wgaXMgZGVzdHJveWVkXG4gIGZ1bmN0aW9uIGRlc3Ryb3lUZXh0dXJlcyAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1UZXhVbml0czsgKytpKSB7XG4gICAgICBnbC5hY3RpdmVUZXh0dXJlKEdMX1RFWFRVUkUwICsgaSlcbiAgICAgIGdsLmJpbmRUZXh0dXJlKEdMX1RFWFRVUkVfMkQsIG51bGwpXG4gICAgICB0ZXh0dXJlVW5pdHNbaV0gPSBudWxsXG4gICAgfVxuICAgIHZhbHVlcyh0ZXh0dXJlU2V0KS5mb3JFYWNoKGRlc3Ryb3kpXG5cbiAgICBzdGF0cy5jdWJlQ291bnQgPSAwXG4gICAgc3RhdHMudGV4dHVyZUNvdW50ID0gMFxuICB9XG5cbiAgaWYgKGNvbmZpZy5wcm9maWxlKSB7XG4gICAgc3RhdHMuZ2V0VG90YWxUZXh0dXJlU2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB0b3RhbCA9IDBcbiAgICAgIE9iamVjdC5rZXlzKHRleHR1cmVTZXQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB0b3RhbCArPSB0ZXh0dXJlU2V0W2tleV0uc3RhdHMuc2l6ZVxuICAgICAgfSlcbiAgICAgIHJldHVybiB0b3RhbFxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc3RvcmVUZXh0dXJlcyAoKSB7XG4gICAgdmFsdWVzKHRleHR1cmVTZXQpLmZvckVhY2goZnVuY3Rpb24gKHRleHR1cmUpIHtcbiAgICAgIHRleHR1cmUudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKVxuICAgICAgZ2wuYmluZFRleHR1cmUodGV4dHVyZS50YXJnZXQsIHRleHR1cmUudGV4dHVyZSlcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzI7ICsraSkge1xuICAgICAgICBpZiAoKHRleHR1cmUubWlwbWFzayAmICgxIDw8IGkpKSA9PT0gMCkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHR1cmUudGFyZ2V0ID09PSBHTF9URVhUVVJFXzJEKSB7XG4gICAgICAgICAgZ2wudGV4SW1hZ2UyRChHTF9URVhUVVJFXzJELFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIHRleHR1cmUuaW50ZXJuYWxmb3JtYXQsXG4gICAgICAgICAgICB0ZXh0dXJlLndpZHRoID4+IGksXG4gICAgICAgICAgICB0ZXh0dXJlLmhlaWdodCA+PiBpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHRleHR1cmUuaW50ZXJuYWxmb3JtYXQsXG4gICAgICAgICAgICB0ZXh0dXJlLnR5cGUsXG4gICAgICAgICAgICBudWxsKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgNjsgKytqKSB7XG4gICAgICAgICAgICBnbC50ZXhJbWFnZTJEKEdMX1RFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCArIGosXG4gICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgIHRleHR1cmUuaW50ZXJuYWxmb3JtYXQsXG4gICAgICAgICAgICAgIHRleHR1cmUud2lkdGggPj4gaSxcbiAgICAgICAgICAgICAgdGV4dHVyZS5oZWlnaHQgPj4gaSxcbiAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgdGV4dHVyZS5pbnRlcm5hbGZvcm1hdCxcbiAgICAgICAgICAgICAgdGV4dHVyZS50eXBlLFxuICAgICAgICAgICAgICBudWxsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2V0VGV4SW5mbyh0ZXh0dXJlLnRleEluZm8sIHRleHR1cmUudGFyZ2V0KVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNyZWF0ZTJEOiBjcmVhdGVUZXh0dXJlMkQsXG4gICAgY3JlYXRlQ3ViZTogY3JlYXRlVGV4dHVyZUN1YmUsXG4gICAgY2xlYXI6IGRlc3Ryb3lUZXh0dXJlcyxcbiAgICBnZXRUZXh0dXJlOiBmdW5jdGlvbiAod3JhcHBlcikge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9LFxuICAgIHJlc3RvcmU6IHJlc3RvcmVUZXh0dXJlc1xuICB9XG59XG4iLCJ2YXIgR0xfUVVFUllfUkVTVUxUX0VYVCA9IDB4ODg2NlxudmFyIEdMX1FVRVJZX1JFU1VMVF9BVkFJTEFCTEVfRVhUID0gMHg4ODY3XG52YXIgR0xfVElNRV9FTEFQU0VEX0VYVCA9IDB4ODhCRlxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChnbCwgZXh0ZW5zaW9ucykge1xuICB2YXIgZXh0VGltZXIgPSBleHRlbnNpb25zLmV4dF9kaXNqb2ludF90aW1lcl9xdWVyeVxuXG4gIGlmICghZXh0VGltZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgLy8gUVVFUlkgUE9PTCBCRUdJTlxuICB2YXIgcXVlcnlQb29sID0gW11cbiAgZnVuY3Rpb24gYWxsb2NRdWVyeSAoKSB7XG4gICAgcmV0dXJuIHF1ZXJ5UG9vbC5wb3AoKSB8fCBleHRUaW1lci5jcmVhdGVRdWVyeUVYVCgpXG4gIH1cbiAgZnVuY3Rpb24gZnJlZVF1ZXJ5IChxdWVyeSkge1xuICAgIHF1ZXJ5UG9vbC5wdXNoKHF1ZXJ5KVxuICB9XG4gIC8vIFFVRVJZIFBPT0wgRU5EXG5cbiAgdmFyIHBlbmRpbmdRdWVyaWVzID0gW11cbiAgZnVuY3Rpb24gYmVnaW5RdWVyeSAoc3RhdHMpIHtcbiAgICB2YXIgcXVlcnkgPSBhbGxvY1F1ZXJ5KClcbiAgICBleHRUaW1lci5iZWdpblF1ZXJ5RVhUKEdMX1RJTUVfRUxBUFNFRF9FWFQsIHF1ZXJ5KVxuICAgIHBlbmRpbmdRdWVyaWVzLnB1c2gocXVlcnkpXG4gICAgcHVzaFNjb3BlU3RhdHMocGVuZGluZ1F1ZXJpZXMubGVuZ3RoIC0gMSwgcGVuZGluZ1F1ZXJpZXMubGVuZ3RoLCBzdGF0cylcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZFF1ZXJ5ICgpIHtcbiAgICBleHRUaW1lci5lbmRRdWVyeUVYVChHTF9USU1FX0VMQVBTRURfRVhUKVxuICB9XG5cbiAgLy9cbiAgLy8gUGVuZGluZyBzdGF0cyBwb29sLlxuICAvL1xuICBmdW5jdGlvbiBQZW5kaW5nU3RhdHMgKCkge1xuICAgIHRoaXMuc3RhcnRRdWVyeUluZGV4ID0gLTFcbiAgICB0aGlzLmVuZFF1ZXJ5SW5kZXggPSAtMVxuICAgIHRoaXMuc3VtID0gMFxuICAgIHRoaXMuc3RhdHMgPSBudWxsXG4gIH1cbiAgdmFyIHBlbmRpbmdTdGF0c1Bvb2wgPSBbXVxuICBmdW5jdGlvbiBhbGxvY1BlbmRpbmdTdGF0cyAoKSB7XG4gICAgcmV0dXJuIHBlbmRpbmdTdGF0c1Bvb2wucG9wKCkgfHwgbmV3IFBlbmRpbmdTdGF0cygpXG4gIH1cbiAgZnVuY3Rpb24gZnJlZVBlbmRpbmdTdGF0cyAocGVuZGluZ1N0YXRzKSB7XG4gICAgcGVuZGluZ1N0YXRzUG9vbC5wdXNoKHBlbmRpbmdTdGF0cylcbiAgfVxuICAvLyBQZW5kaW5nIHN0YXRzIHBvb2wgZW5kXG5cbiAgdmFyIHBlbmRpbmdTdGF0cyA9IFtdXG4gIGZ1bmN0aW9uIHB1c2hTY29wZVN0YXRzIChzdGFydCwgZW5kLCBzdGF0cykge1xuICAgIHZhciBwcyA9IGFsbG9jUGVuZGluZ1N0YXRzKClcbiAgICBwcy5zdGFydFF1ZXJ5SW5kZXggPSBzdGFydFxuICAgIHBzLmVuZFF1ZXJ5SW5kZXggPSBlbmRcbiAgICBwcy5zdW0gPSAwXG4gICAgcHMuc3RhdHMgPSBzdGF0c1xuICAgIHBlbmRpbmdTdGF0cy5wdXNoKHBzKVxuICB9XG5cbiAgLy8gd2Ugc2hvdWxkIGNhbGwgdGhpcyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmcmFtZSxcbiAgLy8gaW4gb3JkZXIgdG8gdXBkYXRlIGdwdVRpbWVcbiAgdmFyIHRpbWVTdW0gPSBbXVxuICB2YXIgcXVlcnlQdHIgPSBbXVxuICBmdW5jdGlvbiB1cGRhdGUgKCkge1xuICAgIHZhciBwdHIsIGlcblxuICAgIHZhciBuID0gcGVuZGluZ1F1ZXJpZXMubGVuZ3RoXG4gICAgaWYgKG4gPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFJlc2VydmUgc3BhY2VcbiAgICBxdWVyeVB0ci5sZW5ndGggPSBNYXRoLm1heChxdWVyeVB0ci5sZW5ndGgsIG4gKyAxKVxuICAgIHRpbWVTdW0ubGVuZ3RoID0gTWF0aC5tYXgodGltZVN1bS5sZW5ndGgsIG4gKyAxKVxuICAgIHRpbWVTdW1bMF0gPSAwXG4gICAgcXVlcnlQdHJbMF0gPSAwXG5cbiAgICAvLyBVcGRhdGUgYWxsIHBlbmRpbmcgdGltZXIgcXVlcmllc1xuICAgIHZhciBxdWVyeVRpbWUgPSAwXG4gICAgcHRyID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBwZW5kaW5nUXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHF1ZXJ5ID0gcGVuZGluZ1F1ZXJpZXNbaV1cbiAgICAgIGlmIChleHRUaW1lci5nZXRRdWVyeU9iamVjdEVYVChxdWVyeSwgR0xfUVVFUllfUkVTVUxUX0FWQUlMQUJMRV9FWFQpKSB7XG4gICAgICAgIHF1ZXJ5VGltZSArPSBleHRUaW1lci5nZXRRdWVyeU9iamVjdEVYVChxdWVyeSwgR0xfUVVFUllfUkVTVUxUX0VYVClcbiAgICAgICAgZnJlZVF1ZXJ5KHF1ZXJ5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVuZGluZ1F1ZXJpZXNbcHRyKytdID0gcXVlcnlcbiAgICAgIH1cbiAgICAgIHRpbWVTdW1baSArIDFdID0gcXVlcnlUaW1lXG4gICAgICBxdWVyeVB0cltpICsgMV0gPSBwdHJcbiAgICB9XG4gICAgcGVuZGluZ1F1ZXJpZXMubGVuZ3RoID0gcHRyXG5cbiAgICAvLyBVcGRhdGUgYWxsIHBlbmRpbmcgc3RhdCBxdWVyaWVzXG4gICAgcHRyID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBwZW5kaW5nU3RhdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBzdGF0cyA9IHBlbmRpbmdTdGF0c1tpXVxuICAgICAgdmFyIHN0YXJ0ID0gc3RhdHMuc3RhcnRRdWVyeUluZGV4XG4gICAgICB2YXIgZW5kID0gc3RhdHMuZW5kUXVlcnlJbmRleFxuICAgICAgc3RhdHMuc3VtICs9IHRpbWVTdW1bZW5kXSAtIHRpbWVTdW1bc3RhcnRdXG4gICAgICB2YXIgc3RhcnRQdHIgPSBxdWVyeVB0cltzdGFydF1cbiAgICAgIHZhciBlbmRQdHIgPSBxdWVyeVB0cltlbmRdXG4gICAgICBpZiAoZW5kUHRyID09PSBzdGFydFB0cikge1xuICAgICAgICBzdGF0cy5zdGF0cy5ncHVUaW1lICs9IHN0YXRzLnN1bSAvIDFlNlxuICAgICAgICBmcmVlUGVuZGluZ1N0YXRzKHN0YXRzKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdHMuc3RhcnRRdWVyeUluZGV4ID0gc3RhcnRQdHJcbiAgICAgICAgc3RhdHMuZW5kUXVlcnlJbmRleCA9IGVuZFB0clxuICAgICAgICBwZW5kaW5nU3RhdHNbcHRyKytdID0gc3RhdHNcbiAgICAgIH1cbiAgICB9XG4gICAgcGVuZGluZ1N0YXRzLmxlbmd0aCA9IHB0clxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiZWdpblF1ZXJ5OiBiZWdpblF1ZXJ5LFxuICAgIGVuZFF1ZXJ5OiBlbmRRdWVyeSxcbiAgICBwdXNoU2NvcGVTdGF0czogcHVzaFNjb3BlU3RhdHMsXG4gICAgdXBkYXRlOiB1cGRhdGUsXG4gICAgZ2V0TnVtUGVuZGluZ1F1ZXJpZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBwZW5kaW5nUXVlcmllcy5sZW5ndGhcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICBxdWVyeVBvb2wucHVzaC5hcHBseShxdWVyeVBvb2wsIHBlbmRpbmdRdWVyaWVzKVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBxdWVyeVBvb2wubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXh0VGltZXIuZGVsZXRlUXVlcnlFWFQocXVlcnlQb29sW2ldKVxuICAgICAgfVxuICAgICAgcGVuZGluZ1F1ZXJpZXMubGVuZ3RoID0gMFxuICAgICAgcXVlcnlQb29sLmxlbmd0aCA9IDBcbiAgICB9LFxuICAgIHJlc3RvcmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHBlbmRpbmdRdWVyaWVzLmxlbmd0aCA9IDBcbiAgICAgIHF1ZXJ5UG9vbC5sZW5ndGggPSAwXG4gICAgfVxuICB9XG59XG4iLCIvKiBnbG9iYWxzIHBlcmZvcm1hbmNlICovXG5tb2R1bGUuZXhwb3J0cyA9XG4gICh0eXBlb2YgcGVyZm9ybWFuY2UgIT09ICd1bmRlZmluZWQnICYmIHBlcmZvcm1hbmNlLm5vdylcbiAgPyBmdW5jdGlvbiAoKSB7IHJldHVybiBwZXJmb3JtYW5jZS5ub3coKSB9XG4gIDogZnVuY3Rpb24gKCkgeyByZXR1cm4gKyhuZXcgRGF0ZSgpKSB9XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi9leHRlbmQnKVxuXG5mdW5jdGlvbiBzbGljZSAoeCkge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoeClcbn1cblxuZnVuY3Rpb24gam9pbiAoeCkge1xuICByZXR1cm4gc2xpY2UoeCkuam9pbignJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFbnZpcm9ubWVudCAoKSB7XG4gIC8vIFVuaXF1ZSB2YXJpYWJsZSBpZCBjb3VudGVyXG4gIHZhciB2YXJDb3VudGVyID0gMFxuXG4gIC8vIExpbmtlZCB2YWx1ZXMgYXJlIHBhc3NlZCBmcm9tIHRoaXMgc2NvcGUgaW50byB0aGUgZ2VuZXJhdGVkIGNvZGUgYmxvY2tcbiAgLy8gQ2FsbGluZyBsaW5rKCkgcGFzc2VzIGEgdmFsdWUgaW50byB0aGUgZ2VuZXJhdGVkIHNjb3BlIGFuZCByZXR1cm5zXG4gIC8vIHRoZSB2YXJpYWJsZSBuYW1lIHdoaWNoIGl0IGlzIGJvdW5kIHRvXG4gIHZhciBsaW5rZWROYW1lcyA9IFtdXG4gIHZhciBsaW5rZWRWYWx1ZXMgPSBbXVxuICBmdW5jdGlvbiBsaW5rICh2YWx1ZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlua2VkVmFsdWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAobGlua2VkVmFsdWVzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gbGlua2VkTmFtZXNbaV1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbmFtZSA9ICdnJyArICh2YXJDb3VudGVyKyspXG4gICAgbGlua2VkTmFtZXMucHVzaChuYW1lKVxuICAgIGxpbmtlZFZhbHVlcy5wdXNoKHZhbHVlKVxuICAgIHJldHVybiBuYW1lXG4gIH1cblxuICAvLyBjcmVhdGUgYSBjb2RlIGJsb2NrXG4gIGZ1bmN0aW9uIGJsb2NrICgpIHtcbiAgICB2YXIgY29kZSA9IFtdXG4gICAgZnVuY3Rpb24gcHVzaCAoKSB7XG4gICAgICBjb2RlLnB1c2guYXBwbHkoY29kZSwgc2xpY2UoYXJndW1lbnRzKSlcbiAgICB9XG5cbiAgICB2YXIgdmFycyA9IFtdXG4gICAgZnVuY3Rpb24gZGVmICgpIHtcbiAgICAgIHZhciBuYW1lID0gJ3YnICsgKHZhckNvdW50ZXIrKylcbiAgICAgIHZhcnMucHVzaChuYW1lKVxuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29kZS5wdXNoKG5hbWUsICc9JylcbiAgICAgICAgY29kZS5wdXNoLmFwcGx5KGNvZGUsIHNsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIGNvZGUucHVzaCgnOycpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuYW1lXG4gICAgfVxuXG4gICAgcmV0dXJuIGV4dGVuZChwdXNoLCB7XG4gICAgICBkZWY6IGRlZixcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBqb2luKFtcbiAgICAgICAgICAodmFycy5sZW5ndGggPiAwID8gJ3ZhciAnICsgdmFycyArICc7JyA6ICcnKSxcbiAgICAgICAgICBqb2luKGNvZGUpXG4gICAgICAgIF0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHNjb3BlICgpIHtcbiAgICB2YXIgZW50cnkgPSBibG9jaygpXG4gICAgdmFyIGV4aXQgPSBibG9jaygpXG5cbiAgICB2YXIgZW50cnlUb1N0cmluZyA9IGVudHJ5LnRvU3RyaW5nXG4gICAgdmFyIGV4aXRUb1N0cmluZyA9IGV4aXQudG9TdHJpbmdcblxuICAgIGZ1bmN0aW9uIHNhdmUgKG9iamVjdCwgcHJvcCkge1xuICAgICAgZXhpdChvYmplY3QsIHByb3AsICc9JywgZW50cnkuZGVmKG9iamVjdCwgcHJvcCksICc7JylcbiAgICB9XG5cbiAgICByZXR1cm4gZXh0ZW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgIGVudHJ5LmFwcGx5KGVudHJ5LCBzbGljZShhcmd1bWVudHMpKVxuICAgIH0sIHtcbiAgICAgIGRlZjogZW50cnkuZGVmLFxuICAgICAgZW50cnk6IGVudHJ5LFxuICAgICAgZXhpdDogZXhpdCxcbiAgICAgIHNhdmU6IHNhdmUsXG4gICAgICBzZXQ6IGZ1bmN0aW9uIChvYmplY3QsIHByb3AsIHZhbHVlKSB7XG4gICAgICAgIHNhdmUob2JqZWN0LCBwcm9wKVxuICAgICAgICBlbnRyeShvYmplY3QsIHByb3AsICc9JywgdmFsdWUsICc7JylcbiAgICAgIH0sXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZW50cnlUb1N0cmluZygpICsgZXhpdFRvU3RyaW5nKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZGl0aW9uYWwgKCkge1xuICAgIHZhciBwcmVkID0gam9pbihhcmd1bWVudHMpXG4gICAgdmFyIHRoZW5CbG9jayA9IHNjb3BlKClcbiAgICB2YXIgZWxzZUJsb2NrID0gc2NvcGUoKVxuXG4gICAgdmFyIHRoZW5Ub1N0cmluZyA9IHRoZW5CbG9jay50b1N0cmluZ1xuICAgIHZhciBlbHNlVG9TdHJpbmcgPSBlbHNlQmxvY2sudG9TdHJpbmdcblxuICAgIHJldHVybiBleHRlbmQodGhlbkJsb2NrLCB7XG4gICAgICB0aGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoZW5CbG9jay5hcHBseSh0aGVuQmxvY2ssIHNsaWNlKGFyZ3VtZW50cykpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgICB9LFxuICAgICAgZWxzZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBlbHNlQmxvY2suYXBwbHkoZWxzZUJsb2NrLCBzbGljZShhcmd1bWVudHMpKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfSxcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBlbHNlQ2xhdXNlID0gZWxzZVRvU3RyaW5nKClcbiAgICAgICAgaWYgKGVsc2VDbGF1c2UpIHtcbiAgICAgICAgICBlbHNlQ2xhdXNlID0gJ2Vsc2V7JyArIGVsc2VDbGF1c2UgKyAnfSdcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gam9pbihbXG4gICAgICAgICAgJ2lmKCcsIHByZWQsICcpeycsXG4gICAgICAgICAgdGhlblRvU3RyaW5nKCksXG4gICAgICAgICAgJ30nLCBlbHNlQ2xhdXNlXG4gICAgICAgIF0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8vIHByb2NlZHVyZSBsaXN0XG4gIHZhciBnbG9iYWxCbG9jayA9IGJsb2NrKClcbiAgdmFyIHByb2NlZHVyZXMgPSB7fVxuICBmdW5jdGlvbiBwcm9jIChuYW1lLCBjb3VudCkge1xuICAgIHZhciBhcmdzID0gW11cbiAgICBmdW5jdGlvbiBhcmcgKCkge1xuICAgICAgdmFyIG5hbWUgPSAnYScgKyBhcmdzLmxlbmd0aFxuICAgICAgYXJncy5wdXNoKG5hbWUpXG4gICAgICByZXR1cm4gbmFtZVxuICAgIH1cblxuICAgIGNvdW50ID0gY291bnQgfHwgMFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7ICsraSkge1xuICAgICAgYXJnKClcbiAgICB9XG5cbiAgICB2YXIgYm9keSA9IHNjb3BlKClcbiAgICB2YXIgYm9keVRvU3RyaW5nID0gYm9keS50b1N0cmluZ1xuXG4gICAgdmFyIHJlc3VsdCA9IHByb2NlZHVyZXNbbmFtZV0gPSBleHRlbmQoYm9keSwge1xuICAgICAgYXJnOiBhcmcsXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gam9pbihbXG4gICAgICAgICAgJ2Z1bmN0aW9uKCcsIGFyZ3Muam9pbigpLCAnKXsnLFxuICAgICAgICAgIGJvZHlUb1N0cmluZygpLFxuICAgICAgICAgICd9J1xuICAgICAgICBdKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBmdW5jdGlvbiBjb21waWxlICgpIHtcbiAgICB2YXIgY29kZSA9IFsnXCJ1c2Ugc3RyaWN0XCI7JyxcbiAgICAgIGdsb2JhbEJsb2NrLFxuICAgICAgJ3JldHVybiB7J11cbiAgICBPYmplY3Qua2V5cyhwcm9jZWR1cmVzKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICBjb2RlLnB1c2goJ1wiJywgbmFtZSwgJ1wiOicsIHByb2NlZHVyZXNbbmFtZV0udG9TdHJpbmcoKSwgJywnKVxuICAgIH0pXG4gICAgY29kZS5wdXNoKCd9JylcbiAgICB2YXIgc3JjID0gam9pbihjb2RlKVxuICAgICAgLnJlcGxhY2UoLzsvZywgJztcXG4nKVxuICAgICAgLnJlcGxhY2UoL30vZywgJ31cXG4nKVxuICAgICAgLnJlcGxhY2UoL3svZywgJ3tcXG4nKVxuICAgIHZhciBwcm9jID0gRnVuY3Rpb24uYXBwbHkobnVsbCwgbGlua2VkTmFtZXMuY29uY2F0KHNyYykpXG4gICAgcmV0dXJuIHByb2MuYXBwbHkobnVsbCwgbGlua2VkVmFsdWVzKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnbG9iYWw6IGdsb2JhbEJsb2NrLFxuICAgIGxpbms6IGxpbmssXG4gICAgYmxvY2s6IGJsb2NrLFxuICAgIHByb2M6IHByb2MsXG4gICAgc2NvcGU6IHNjb3BlLFxuICAgIGNvbmQ6IGNvbmRpdGlvbmFsLFxuICAgIGNvbXBpbGU6IGNvbXBpbGVcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYmFzZSwgb3B0cykge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdHMpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgIGJhc2Vba2V5c1tpXV0gPSBvcHRzW2tleXNbaV1dXG4gIH1cbiAgcmV0dXJuIGJhc2Vcbn1cbiIsInZhciBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL2lzLXR5cGVkLWFycmF5Jylcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBcnJheUxpa2UgKHMpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkocykgfHwgaXNUeXBlZEFycmF5KHMpXG59XG4iLCJ2YXIgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9pcy10eXBlZC1hcnJheScpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNOREFycmF5TGlrZSAob2JqKSB7XG4gIHJldHVybiAoXG4gICAgISFvYmogJiZcbiAgICB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJlxuICAgIEFycmF5LmlzQXJyYXkob2JqLnNoYXBlKSAmJlxuICAgIEFycmF5LmlzQXJyYXkob2JqLnN0cmlkZSkgJiZcbiAgICB0eXBlb2Ygb2JqLm9mZnNldCA9PT0gJ251bWJlcicgJiZcbiAgICBvYmouc2hhcGUubGVuZ3RoID09PSBvYmouc3RyaWRlLmxlbmd0aCAmJlxuICAgIChBcnJheS5pc0FycmF5KG9iai5kYXRhKSB8fFxuICAgICAgaXNUeXBlZEFycmF5KG9iai5kYXRhKSkpXG59XG4iLCJ2YXIgZHR5cGVzID0gcmVxdWlyZSgnLi4vY29uc3RhbnRzL2FycmF5dHlwZXMuanNvbicpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoeCkgaW4gZHR5cGVzXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxvb3AgKG4sIGYpIHtcbiAgdmFyIHJlc3VsdCA9IEFycmF5KG4pXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgcmVzdWx0W2ldID0gZihpKVxuICB9XG4gIHJldHVybiByZXN1bHRcbn1cbiIsInZhciBsb29wID0gcmVxdWlyZSgnLi9sb29wJylcblxudmFyIEdMX0JZVEUgPSA1MTIwXG52YXIgR0xfVU5TSUdORURfQllURSA9IDUxMjFcbnZhciBHTF9TSE9SVCA9IDUxMjJcbnZhciBHTF9VTlNJR05FRF9TSE9SVCA9IDUxMjNcbnZhciBHTF9JTlQgPSA1MTI0XG52YXIgR0xfVU5TSUdORURfSU5UID0gNTEyNVxudmFyIEdMX0ZMT0FUID0gNTEyNlxuXG52YXIgYnVmZmVyUG9vbCA9IGxvb3AoOCwgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gW11cbn0pXG5cbmZ1bmN0aW9uIG5leHRQb3cxNiAodikge1xuICBmb3IgKHZhciBpID0gMTY7IGkgPD0gKDEgPDwgMjgpOyBpICo9IDE2KSB7XG4gICAgaWYgKHYgPD0gaSkge1xuICAgICAgcmV0dXJuIGlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gbG9nMiAodikge1xuICB2YXIgciwgc2hpZnRcbiAgciA9ICh2ID4gMHhGRkZGKSA8PCA0XG4gIHYgPj4+PSByXG4gIHNoaWZ0ID0gKHYgPiAweEZGKSA8PCAzXG4gIHYgPj4+PSBzaGlmdDsgciB8PSBzaGlmdFxuICBzaGlmdCA9ICh2ID4gMHhGKSA8PCAyXG4gIHYgPj4+PSBzaGlmdDsgciB8PSBzaGlmdFxuICBzaGlmdCA9ICh2ID4gMHgzKSA8PCAxXG4gIHYgPj4+PSBzaGlmdDsgciB8PSBzaGlmdFxuICByZXR1cm4gciB8ICh2ID4+IDEpXG59XG5cbmZ1bmN0aW9uIGFsbG9jIChuKSB7XG4gIHZhciBzeiA9IG5leHRQb3cxNihuKVxuICB2YXIgYmluID0gYnVmZmVyUG9vbFtsb2cyKHN6KSA+PiAyXVxuICBpZiAoYmluLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gYmluLnBvcCgpXG4gIH1cbiAgcmV0dXJuIG5ldyBBcnJheUJ1ZmZlcihzeilcbn1cblxuZnVuY3Rpb24gZnJlZSAoYnVmKSB7XG4gIGJ1ZmZlclBvb2xbbG9nMihidWYuYnl0ZUxlbmd0aCkgPj4gMl0ucHVzaChidWYpXG59XG5cbmZ1bmN0aW9uIGFsbG9jVHlwZSAodHlwZSwgbikge1xuICB2YXIgcmVzdWx0ID0gbnVsbFxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIEdMX0JZVEU6XG4gICAgICByZXN1bHQgPSBuZXcgSW50OEFycmF5KGFsbG9jKG4pLCAwLCBuKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIEdMX1VOU0lHTkVEX0JZVEU6XG4gICAgICByZXN1bHQgPSBuZXcgVWludDhBcnJheShhbGxvYyhuKSwgMCwgbilcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBHTF9TSE9SVDpcbiAgICAgIHJlc3VsdCA9IG5ldyBJbnQxNkFycmF5KGFsbG9jKDIgKiBuKSwgMCwgbilcbiAgICAgIGJyZWFrXG4gICAgY2FzZSBHTF9VTlNJR05FRF9TSE9SVDpcbiAgICAgIHJlc3VsdCA9IG5ldyBVaW50MTZBcnJheShhbGxvYygyICogbiksIDAsIG4pXG4gICAgICBicmVha1xuICAgIGNhc2UgR0xfSU5UOlxuICAgICAgcmVzdWx0ID0gbmV3IEludDMyQXJyYXkoYWxsb2MoNCAqIG4pLCAwLCBuKVxuICAgICAgYnJlYWtcbiAgICBjYXNlIEdMX1VOU0lHTkVEX0lOVDpcbiAgICAgIHJlc3VsdCA9IG5ldyBVaW50MzJBcnJheShhbGxvYyg0ICogbiksIDAsIG4pXG4gICAgICBicmVha1xuICAgIGNhc2UgR0xfRkxPQVQ6XG4gICAgICByZXN1bHQgPSBuZXcgRmxvYXQzMkFycmF5KGFsbG9jKDQgKiBuKSwgMCwgbilcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKHJlc3VsdC5sZW5ndGggIT09IG4pIHtcbiAgICByZXR1cm4gcmVzdWx0LnN1YmFycmF5KDAsIG4pXG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5mdW5jdGlvbiBmcmVlVHlwZSAoYXJyYXkpIHtcbiAgZnJlZShhcnJheS5idWZmZXIpXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhbGxvYzogYWxsb2MsXG4gIGZyZWU6IGZyZWUsXG4gIGFsbG9jVHlwZTogYWxsb2NUeXBlLFxuICBmcmVlVHlwZTogZnJlZVR5cGVcbn1cbiIsIi8qIGdsb2JhbHMgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCBjYW5jZWxBbmltYXRpb25GcmFtZSAqL1xuaWYgKHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbmV4dDogZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZSh4KSB9LFxuICAgIGNhbmNlbDogZnVuY3Rpb24gKHgpIHsgcmV0dXJuIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHgpIH1cbiAgfVxufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbmV4dDogZnVuY3Rpb24gKGNiKSB7XG4gICAgICByZXR1cm4gc2V0VGltZW91dChjYiwgMTYpXG4gICAgfSxcbiAgICBjYW5jZWw6IGNsZWFyVGltZW91dFxuICB9XG59XG4iLCJ2YXIgcG9vbCA9IHJlcXVpcmUoJy4vcG9vbCcpXG5cbnZhciBGTE9BVCA9IG5ldyBGbG9hdDMyQXJyYXkoMSlcbnZhciBJTlQgPSBuZXcgVWludDMyQXJyYXkoRkxPQVQuYnVmZmVyKVxuXG52YXIgR0xfVU5TSUdORURfU0hPUlQgPSA1MTIzXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29udmVydFRvSGFsZkZsb2F0IChhcnJheSkge1xuICB2YXIgdXNob3J0cyA9IHBvb2wuYWxsb2NUeXBlKEdMX1VOU0lHTkVEX1NIT1JULCBhcnJheS5sZW5ndGgpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7ICsraSkge1xuICAgIGlmIChpc05hTihhcnJheVtpXSkpIHtcbiAgICAgIHVzaG9ydHNbaV0gPSAweGZmZmZcbiAgICB9IGVsc2UgaWYgKGFycmF5W2ldID09PSBJbmZpbml0eSkge1xuICAgICAgdXNob3J0c1tpXSA9IDB4N2MwMFxuICAgIH0gZWxzZSBpZiAoYXJyYXlbaV0gPT09IC1JbmZpbml0eSkge1xuICAgICAgdXNob3J0c1tpXSA9IDB4ZmMwMFxuICAgIH0gZWxzZSB7XG4gICAgICBGTE9BVFswXSA9IGFycmF5W2ldXG4gICAgICB2YXIgeCA9IElOVFswXVxuXG4gICAgICB2YXIgc2duID0gKHggPj4+IDMxKSA8PCAxNVxuICAgICAgdmFyIGV4cCA9ICgoeCA8PCAxKSA+Pj4gMjQpIC0gMTI3XG4gICAgICB2YXIgZnJhYyA9ICh4ID4+IDEzKSAmICgoMSA8PCAxMCkgLSAxKVxuXG4gICAgICBpZiAoZXhwIDwgLTI0KSB7XG4gICAgICAgIC8vIHJvdW5kIG5vbi1yZXByZXNlbnRhYmxlIGRlbm9ybWFscyB0byAwXG4gICAgICAgIHVzaG9ydHNbaV0gPSBzZ25cbiAgICAgIH0gZWxzZSBpZiAoZXhwIDwgLTE0KSB7XG4gICAgICAgIC8vIGhhbmRsZSBkZW5vcm1hbHNcbiAgICAgICAgdmFyIHMgPSAtMTQgLSBleHBcbiAgICAgICAgdXNob3J0c1tpXSA9IHNnbiArICgoZnJhYyArICgxIDw8IDEwKSkgPj4gcylcbiAgICAgIH0gZWxzZSBpZiAoZXhwID4gMTUpIHtcbiAgICAgICAgLy8gcm91bmQgb3ZlcmZsb3cgdG8gKy8tIEluZmluaXR5XG4gICAgICAgIHVzaG9ydHNbaV0gPSBzZ24gKyAweDdjMDBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG90aGVyd2lzZSBjb252ZXJ0IGRpcmVjdGx5XG4gICAgICAgIHVzaG9ydHNbaV0gPSBzZ24gKyAoKGV4cCArIDE1KSA8PCAxMCkgKyBmcmFjXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVzaG9ydHNcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gb2JqW2tleV0gfSlcbn1cbiIsIi8vIENvbnRleHQgYW5kIGNhbnZhcyBjcmVhdGlvbiBoZWxwZXIgZnVuY3Rpb25zXG5cbnZhciBleHRlbmQgPSByZXF1aXJlKCcuL3V0aWwvZXh0ZW5kJylcblxuZnVuY3Rpb24gY3JlYXRlQ2FudmFzIChlbGVtZW50LCBvbkRvbmUsIHBpeGVsUmF0aW8pIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gIGV4dGVuZChjYW52YXMuc3R5bGUsIHtcbiAgICBib3JkZXI6IDAsXG4gICAgbWFyZ2luOiAwLFxuICAgIHBhZGRpbmc6IDAsXG4gICAgdG9wOiAwLFxuICAgIGxlZnQ6IDBcbiAgfSlcbiAgZWxlbWVudC5hcHBlbmRDaGlsZChjYW52YXMpXG5cbiAgaWYgKGVsZW1lbnQgPT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgZXh0ZW5kKGVsZW1lbnQuc3R5bGUsIHtcbiAgICAgIG1hcmdpbjogMCxcbiAgICAgIHBhZGRpbmc6IDBcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzaXplICgpIHtcbiAgICB2YXIgdyA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgdmFyIGggPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICBpZiAoZWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgdmFyIGJvdW5kcyA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIHcgPSBib3VuZHMucmlnaHQgLSBib3VuZHMubGVmdFxuICAgICAgaCA9IGJvdW5kcy50b3AgLSBib3VuZHMuYm90dG9tXG4gICAgfVxuICAgIGNhbnZhcy53aWR0aCA9IHBpeGVsUmF0aW8gKiB3XG4gICAgY2FudmFzLmhlaWdodCA9IHBpeGVsUmF0aW8gKiBoXG4gICAgZXh0ZW5kKGNhbnZhcy5zdHlsZSwge1xuICAgICAgd2lkdGg6IHcgKyAncHgnLFxuICAgICAgaGVpZ2h0OiBoICsgJ3B4J1xuICAgIH0pXG4gIH1cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplLCBmYWxzZSlcblxuICBmdW5jdGlvbiBvbkRlc3Ryb3kgKCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemUpXG4gICAgZWxlbWVudC5yZW1vdmVDaGlsZChjYW52YXMpXG4gIH1cblxuICByZXNpemUoKVxuXG4gIHJldHVybiB7XG4gICAgY2FudmFzOiBjYW52YXMsXG4gICAgb25EZXN0cm95OiBvbkRlc3Ryb3lcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDb250ZXh0IChjYW52YXMsIGNvbnRleEF0dHJpYnV0ZXMpIHtcbiAgZnVuY3Rpb24gZ2V0IChuYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBjYW52YXMuZ2V0Q29udGV4dChuYW1lLCBjb250ZXhBdHRyaWJ1dGVzKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG4gIHJldHVybiAoXG4gICAgZ2V0KCd3ZWJnbCcpIHx8XG4gICAgZ2V0KCdleHBlcmltZW50YWwtd2ViZ2wnKSB8fFxuICAgIGdldCgnd2ViZ2wtZXhwZXJpbWVudGFsJylcbiAgKVxufVxuXG5mdW5jdGlvbiBpc0hUTUxFbGVtZW50IChvYmopIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygb2JqLm5vZGVOYW1lID09PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiBvYmouYXBwZW5kQ2hpbGQgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2Ygb2JqLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICApXG59XG5cbmZ1bmN0aW9uIGlzV2ViR0xDb250ZXh0IChvYmopIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygb2JqLmRyYXdBcnJheXMgPT09ICdmdW5jdGlvbicgfHxcbiAgICB0eXBlb2Ygb2JqLmRyYXdFbGVtZW50cyA9PT0gJ2Z1bmN0aW9uJ1xuICApXG59XG5cbmZ1bmN0aW9uIHBhcnNlRXh0ZW5zaW9ucyAoaW5wdXQpIHtcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gaW5wdXQuc3BsaXQoKVxuICB9XG4gIFxuICByZXR1cm4gaW5wdXRcbn1cblxuZnVuY3Rpb24gZ2V0RWxlbWVudCAoZGVzYykge1xuICBpZiAodHlwZW9mIGRlc2MgPT09ICdzdHJpbmcnKSB7XG4gICAgXG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZGVzYylcbiAgfVxuICByZXR1cm4gZGVzY1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlQXJncyAoYXJnc18pIHtcbiAgdmFyIGFyZ3MgPSBhcmdzXyB8fCB7fVxuICB2YXIgZWxlbWVudCwgY29udGFpbmVyLCBjYW52YXMsIGdsXG4gIHZhciBjb250ZXh0QXR0cmlidXRlcyA9IHt9XG4gIHZhciBleHRlbnNpb25zID0gW11cbiAgdmFyIG9wdGlvbmFsRXh0ZW5zaW9ucyA9IFtdXG4gIHZhciBwaXhlbFJhdGlvID0gKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gMSA6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKVxuICB2YXIgcHJvZmlsZSA9IGZhbHNlXG4gIHZhciBvbkRvbmUgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgaWYgKGVycikge1xuICAgICAgXG4gICAgfVxuICB9XG4gIHZhciBvbkRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7fVxuICBpZiAodHlwZW9mIGFyZ3MgPT09ICdzdHJpbmcnKSB7XG4gICAgXG4gICAgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYXJncylcbiAgICBcbiAgfSBlbHNlIGlmICh0eXBlb2YgYXJncyA9PT0gJ29iamVjdCcpIHtcbiAgICBpZiAoaXNIVE1MRWxlbWVudChhcmdzKSkge1xuICAgICAgZWxlbWVudCA9IGFyZ3NcbiAgICB9IGVsc2UgaWYgKGlzV2ViR0xDb250ZXh0KGFyZ3MpKSB7XG4gICAgICBnbCA9IGFyZ3NcbiAgICAgIGNhbnZhcyA9IGdsLmNhbnZhc1xuICAgIH0gZWxzZSB7XG4gICAgICBcbiAgICAgIGlmICgnZ2wnIGluIGFyZ3MpIHtcbiAgICAgICAgZ2wgPSBhcmdzLmdsXG4gICAgICB9IGVsc2UgaWYgKCdjYW52YXMnIGluIGFyZ3MpIHtcbiAgICAgICAgY2FudmFzID0gZ2V0RWxlbWVudChhcmdzLmNhbnZhcylcbiAgICAgIH0gZWxzZSBpZiAoJ2NvbnRhaW5lcicgaW4gYXJncykge1xuICAgICAgICBjb250YWluZXIgPSBnZXRFbGVtZW50KGFyZ3MuY29udGFpbmVyKVxuICAgICAgfVxuICAgICAgaWYgKCdhdHRyaWJ1dGVzJyBpbiBhcmdzKSB7XG4gICAgICAgIGNvbnRleHRBdHRyaWJ1dGVzID0gYXJncy5hdHRyaWJ1dGVzXG4gICAgICAgIFxuICAgICAgfVxuICAgICAgaWYgKCdleHRlbnNpb25zJyBpbiBhcmdzKSB7XG4gICAgICAgIGV4dGVuc2lvbnMgPSBwYXJzZUV4dGVuc2lvbnMoYXJncy5leHRlbnNpb25zKVxuICAgICAgfVxuICAgICAgaWYgKCdvcHRpb25hbEV4dGVuc2lvbnMnIGluIGFyZ3MpIHtcbiAgICAgICAgb3B0aW9uYWxFeHRlbnNpb25zID0gcGFyc2VFeHRlbnNpb25zKGFyZ3Mub3B0aW9uYWxFeHRlbnNpb25zKVxuICAgICAgfVxuICAgICAgaWYgKCdvbkRvbmUnIGluIGFyZ3MpIHtcbiAgICAgICAgXG4gICAgICAgIG9uRG9uZSA9IGFyZ3Mub25Eb25lXG4gICAgICB9XG4gICAgICBpZiAoJ3Byb2ZpbGUnIGluIGFyZ3MpIHtcbiAgICAgICAgcHJvZmlsZSA9ICEhYXJncy5wcm9maWxlXG4gICAgICB9XG4gICAgICBpZiAoJ3BpeGVsUmF0aW8nIGluIGFyZ3MpIHtcbiAgICAgICAgcGl4ZWxSYXRpbyA9ICthcmdzLnBpeGVsUmF0aW9cbiAgICAgICAgXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIFxuICB9XG5cbiAgaWYgKGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnY2FudmFzJykge1xuICAgICAgY2FudmFzID0gZWxlbWVudFxuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIgPSBlbGVtZW50XG4gICAgfVxuICB9XG5cbiAgaWYgKCFnbCkge1xuICAgIGlmICghY2FudmFzKSB7XG4gICAgICBcbiAgICAgIHZhciByZXN1bHQgPSBjcmVhdGVDYW52YXMoY29udGFpbmVyIHx8IGRvY3VtZW50LmJvZHksIG9uRG9uZSwgcGl4ZWxSYXRpbylcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICB9XG4gICAgICBjYW52YXMgPSByZXN1bHQuY2FudmFzXG4gICAgICBvbkRlc3Ryb3kgPSByZXN1bHQub25EZXN0cm95XG4gICAgfVxuICAgIGdsID0gY3JlYXRlQ29udGV4dChjYW52YXMsIGNvbnRleHRBdHRyaWJ1dGVzKVxuICB9XG5cbiAgaWYgKCFnbCkge1xuICAgIG9uRGVzdHJveSgpXG4gICAgb25Eb25lKCd3ZWJnbCBub3Qgc3VwcG9ydGVkLCB0cnkgdXBncmFkaW5nIHlvdXIgYnJvd3NlciBvciBncmFwaGljcyBkcml2ZXJzIGh0dHA6Ly9nZXQud2ViZ2wub3JnJylcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnbDogZ2wsXG4gICAgY2FudmFzOiBjYW52YXMsXG4gICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgZXh0ZW5zaW9uczogZXh0ZW5zaW9ucyxcbiAgICBvcHRpb25hbEV4dGVuc2lvbnM6IG9wdGlvbmFsRXh0ZW5zaW9ucyxcbiAgICBwaXhlbFJhdGlvOiBwaXhlbFJhdGlvLFxuICAgIHByb2ZpbGU6IHByb2ZpbGUsXG4gICAgb25Eb25lOiBvbkRvbmUsXG4gICAgb25EZXN0cm95OiBvbkRlc3Ryb3lcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBhZGpvaW50O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gYWRqb2ludChvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICAgIG91dFswXSAgPSAgKGExMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gICAgb3V0WzFdICA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgICBvdXRbMl0gID0gIChhMDEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMSAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICAgIG91dFszXSAgPSAtKGEwMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpIC0gYTExICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikgKyBhMjEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzRdICA9IC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgICBvdXRbNV0gID0gIChhMDAgKiAoYTIyICogYTMzIC0gYTIzICogYTMyKSAtIGEyMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGEyMyAtIGEwMyAqIGEyMikpO1xuICAgIG91dFs2XSAgPSAtKGEwMCAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTEwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKSk7XG4gICAgb3V0WzddICA9ICAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgICBvdXRbOF0gID0gIChhMTAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzMgLSBhMTMgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkpO1xuICAgIG91dFs5XSAgPSAtKGEwMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGEwMSAqIGEzMyAtIGEwMyAqIGEzMSkgKyBhMzAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSk7XG4gICAgb3V0WzEwXSA9ICAoYTAwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgICBvdXRbMTFdID0gLShhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSkpO1xuICAgIG91dFsxMl0gPSAtKGExMCAqIChhMjEgKiBhMzIgLSBhMjIgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIyIC0gYTEyICogYTIxKSk7XG4gICAgb3V0WzEzXSA9ICAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpKTtcbiAgICBvdXRbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICAgIG91dFsxNV0gPSAgKGEwMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpIC0gYTEwICogKGEwMSAqIGEyMiAtIGEwMiAqIGEyMSkgKyBhMjAgKiAoYTAxICogYTEyIC0gYTAyICogYTExKSk7XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBjbG9uZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxuICovXG5mdW5jdGlvbiBjbG9uZShhKSB7XG4gICAgdmFyIG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbNl07XG4gICAgb3V0WzddID0gYVs3XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBjb3B5O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQ0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzFdO1xuICAgIG91dFsyXSA9IGFbMl07XG4gICAgb3V0WzNdID0gYVszXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFs4XSA9IGFbOF07XG4gICAgb3V0WzldID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICByZXR1cm4gb3V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDRcbiAqXG4gKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxuICovXG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xuICAgIG91dFswXSA9IDE7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAxO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDE7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBkZXRlcm1pbmFudDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xuZnVuY3Rpb24gZGV0ZXJtaW5hbnQoYSkge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdLFxuXG4gICAgICAgIGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcbiAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG4gICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcbiAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG4gICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcbiAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG4gICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcbiAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gICAgcmV0dXJuIGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmcm9tUXVhdDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICAgIHgyID0geCArIHgsXG4gICAgICAgIHkyID0geSArIHksXG4gICAgICAgIHoyID0geiArIHosXG5cbiAgICAgICAgeHggPSB4ICogeDIsXG4gICAgICAgIHl4ID0geSAqIHgyLFxuICAgICAgICB5eSA9IHkgKiB5MixcbiAgICAgICAgenggPSB6ICogeDIsXG4gICAgICAgIHp5ID0geiAqIHkyLFxuICAgICAgICB6eiA9IHogKiB6MixcbiAgICAgICAgd3ggPSB3ICogeDIsXG4gICAgICAgIHd5ID0gdyAqIHkyLFxuICAgICAgICB3eiA9IHcgKiB6MjtcblxuICAgIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICAgIG91dFsxXSA9IHl4ICsgd3o7XG4gICAgb3V0WzJdID0genggLSB3eTtcbiAgICBvdXRbM10gPSAwO1xuXG4gICAgb3V0WzRdID0geXggLSB3ejtcbiAgICBvdXRbNV0gPSAxIC0geHggLSB6ejtcbiAgICBvdXRbNl0gPSB6eSArIHd4O1xuICAgIG91dFs3XSA9IDA7XG5cbiAgICBvdXRbOF0gPSB6eCArIHd5O1xuICAgIG91dFs5XSA9IHp5IC0gd3g7XG4gICAgb3V0WzEwXSA9IDEgLSB4eCAtIHl5O1xuICAgIG91dFsxMV0gPSAwO1xuXG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gICAgb3V0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gb3V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24gYW5kIHZlY3RvciB0cmFuc2xhdGlvblxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICB2YXIgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XG4gKiAgICAgcXVhdDQudG9NYXQ0KHF1YXQsIHF1YXRNYXQpO1xuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0NH0gcSBSb3RhdGlvbiBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uKG91dCwgcSwgdikge1xuICAgIC8vIFF1YXRlcm5pb24gbWF0aFxuICAgIHZhciB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXSxcbiAgICAgICAgeDIgPSB4ICsgeCxcbiAgICAgICAgeTIgPSB5ICsgeSxcbiAgICAgICAgejIgPSB6ICsgeixcblxuICAgICAgICB4eCA9IHggKiB4MixcbiAgICAgICAgeHkgPSB4ICogeTIsXG4gICAgICAgIHh6ID0geCAqIHoyLFxuICAgICAgICB5eSA9IHkgKiB5MixcbiAgICAgICAgeXogPSB5ICogejIsXG4gICAgICAgIHp6ID0geiAqIHoyLFxuICAgICAgICB3eCA9IHcgKiB4MixcbiAgICAgICAgd3kgPSB3ICogeTIsXG4gICAgICAgIHd6ID0gdyAqIHoyO1xuXG4gICAgb3V0WzBdID0gMSAtICh5eSArIHp6KTtcbiAgICBvdXRbMV0gPSB4eSArIHd6O1xuICAgIG91dFsyXSA9IHh6IC0gd3k7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSB4eSAtIHd6O1xuICAgIG91dFs1XSA9IDEgLSAoeHggKyB6eik7XG4gICAgb3V0WzZdID0geXogKyB3eDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IHh6ICsgd3k7XG4gICAgb3V0WzldID0geXogLSB3eDtcbiAgICBvdXRbMTBdID0gMSAtICh4eCArIHl5KTtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gdlswXTtcbiAgICBvdXRbMTNdID0gdlsxXTtcbiAgICBvdXRbMTRdID0gdlsyXTtcbiAgICBvdXRbMTVdID0gMTtcbiAgICBcbiAgICByZXR1cm4gb3V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZydXN0dW07XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgZnJ1c3R1bSBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtOdW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gYm90dG9tIEJvdHRvbSBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSBmYXIgRmFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIGZydXN0dW0ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICAgIHZhciBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KSxcbiAgICAgICAgdGIgPSAxIC8gKHRvcCAtIGJvdHRvbSksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSAobmVhciAqIDIpICogcmw7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAobmVhciAqIDIpICogdGI7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IChyaWdodCArIGxlZnQpICogcmw7XG4gICAgb3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YjtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAoZmFyICogbmVhciAqIDIpICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcblxuLyoqXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgICBvdXRbMF0gPSAxO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gMTtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAxO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAwO1xuICAgIG91dFsxNV0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IHJlcXVpcmUoJy4vY3JlYXRlJylcbiAgLCBjbG9uZTogcmVxdWlyZSgnLi9jbG9uZScpXG4gICwgY29weTogcmVxdWlyZSgnLi9jb3B5JylcbiAgLCBpZGVudGl0eTogcmVxdWlyZSgnLi9pZGVudGl0eScpXG4gICwgdHJhbnNwb3NlOiByZXF1aXJlKCcuL3RyYW5zcG9zZScpXG4gICwgaW52ZXJ0OiByZXF1aXJlKCcuL2ludmVydCcpXG4gICwgYWRqb2ludDogcmVxdWlyZSgnLi9hZGpvaW50JylcbiAgLCBkZXRlcm1pbmFudDogcmVxdWlyZSgnLi9kZXRlcm1pbmFudCcpXG4gICwgbXVsdGlwbHk6IHJlcXVpcmUoJy4vbXVsdGlwbHknKVxuICAsIHRyYW5zbGF0ZTogcmVxdWlyZSgnLi90cmFuc2xhdGUnKVxuICAsIHNjYWxlOiByZXF1aXJlKCcuL3NjYWxlJylcbiAgLCByb3RhdGU6IHJlcXVpcmUoJy4vcm90YXRlJylcbiAgLCByb3RhdGVYOiByZXF1aXJlKCcuL3JvdGF0ZVgnKVxuICAsIHJvdGF0ZVk6IHJlcXVpcmUoJy4vcm90YXRlWScpXG4gICwgcm90YXRlWjogcmVxdWlyZSgnLi9yb3RhdGVaJylcbiAgLCBmcm9tUm90YXRpb25UcmFuc2xhdGlvbjogcmVxdWlyZSgnLi9mcm9tUm90YXRpb25UcmFuc2xhdGlvbicpXG4gICwgZnJvbVF1YXQ6IHJlcXVpcmUoJy4vZnJvbVF1YXQnKVxuICAsIGZydXN0dW06IHJlcXVpcmUoJy4vZnJ1c3R1bScpXG4gICwgcGVyc3BlY3RpdmU6IHJlcXVpcmUoJy4vcGVyc3BlY3RpdmUnKVxuICAsIHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3OiByZXF1aXJlKCcuL3BlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3JylcbiAgLCBvcnRobzogcmVxdWlyZSgnLi9vcnRobycpXG4gICwgbG9va0F0OiByZXF1aXJlKCcuL2xvb2tBdCcpXG4gICwgc3RyOiByZXF1aXJlKCcuL3N0cicpXG59IiwibW9kdWxlLmV4cG9ydHMgPSBpbnZlcnQ7XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbiAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbiAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XSxcblxuICAgICAgICBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXG4gICAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcbiAgICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxuICAgICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG4gICAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcbiAgICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuICAgICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXG4gICAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcbiAgICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxuICAgICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG4gICAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcbiAgICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyLFxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgICAgICAgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gICAgaWYgKCFkZXQpIHsgXG4gICAgICAgIHJldHVybiBudWxsOyBcbiAgICB9XG4gICAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gICAgb3V0WzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gICAgb3V0WzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXQ7XG4gICAgb3V0WzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG4gICAgb3V0WzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG4gICAgb3V0WzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuICAgIG91dFsxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXQ7XG4gICAgb3V0WzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuICAgIG91dFsxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldDtcbiAgICBvdXRbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXQ7XG5cbiAgICByZXR1cm4gb3V0O1xufTsiLCJ2YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbG9va0F0O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGxvb2stYXQgbWF0cml4IHdpdGggdGhlIGdpdmVuIGV5ZSBwb3NpdGlvbiwgZm9jYWwgcG9pbnQsIGFuZCB1cCBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxuICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XG4gKiBAcGFyYW0ge3ZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gbG9va0F0KG91dCwgZXllLCBjZW50ZXIsIHVwKSB7XG4gICAgdmFyIHgwLCB4MSwgeDIsIHkwLCB5MSwgeTIsIHowLCB6MSwgejIsIGxlbixcbiAgICAgICAgZXlleCA9IGV5ZVswXSxcbiAgICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgICAgZXlleiA9IGV5ZVsyXSxcbiAgICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgICB1cHogPSB1cFsyXSxcbiAgICAgICAgY2VudGVyeCA9IGNlbnRlclswXSxcbiAgICAgICAgY2VudGVyeSA9IGNlbnRlclsxXSxcbiAgICAgICAgY2VudGVyeiA9IGNlbnRlclsyXTtcblxuICAgIGlmIChNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCAwLjAwMDAwMSAmJlxuICAgICAgICBNYXRoLmFicyhleWV5IC0gY2VudGVyeSkgPCAwLjAwMDAwMSAmJlxuICAgICAgICBNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCAwLjAwMDAwMSkge1xuICAgICAgICByZXR1cm4gaWRlbnRpdHkob3V0KTtcbiAgICB9XG5cbiAgICB6MCA9IGV5ZXggLSBjZW50ZXJ4O1xuICAgIHoxID0gZXlleSAtIGNlbnRlcnk7XG4gICAgejIgPSBleWV6IC0gY2VudGVyejtcblxuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQoejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyKTtcbiAgICB6MCAqPSBsZW47XG4gICAgejEgKj0gbGVuO1xuICAgIHoyICo9IGxlbjtcblxuICAgIHgwID0gdXB5ICogejIgLSB1cHogKiB6MTtcbiAgICB4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XG4gICAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuICAgIGxlbiA9IE1hdGguc3FydCh4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDIpO1xuICAgIGlmICghbGVuKSB7XG4gICAgICAgIHgwID0gMDtcbiAgICAgICAgeDEgPSAwO1xuICAgICAgICB4MiA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gMSAvIGxlbjtcbiAgICAgICAgeDAgKj0gbGVuO1xuICAgICAgICB4MSAqPSBsZW47XG4gICAgICAgIHgyICo9IGxlbjtcbiAgICB9XG5cbiAgICB5MCA9IHoxICogeDIgLSB6MiAqIHgxO1xuICAgIHkxID0gejIgKiB4MCAtIHowICogeDI7XG4gICAgeTIgPSB6MCAqIHgxIC0gejEgKiB4MDtcblxuICAgIGxlbiA9IE1hdGguc3FydCh5MCAqIHkwICsgeTEgKiB5MSArIHkyICogeTIpO1xuICAgIGlmICghbGVuKSB7XG4gICAgICAgIHkwID0gMDtcbiAgICAgICAgeTEgPSAwO1xuICAgICAgICB5MiA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGVuID0gMSAvIGxlbjtcbiAgICAgICAgeTAgKj0gbGVuO1xuICAgICAgICB5MSAqPSBsZW47XG4gICAgICAgIHkyICo9IGxlbjtcbiAgICB9XG5cbiAgICBvdXRbMF0gPSB4MDtcbiAgICBvdXRbMV0gPSB5MDtcbiAgICBvdXRbMl0gPSB6MDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IHgxO1xuICAgIG91dFs1XSA9IHkxO1xuICAgIG91dFs2XSA9IHoxO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0geDI7XG4gICAgb3V0WzldID0geTI7XG4gICAgb3V0WzEwXSA9IHoyO1xuICAgIG91dFsxMV0gPSAwO1xuICAgIG91dFsxMl0gPSAtKHgwICogZXlleCArIHgxICogZXlleSArIHgyICogZXlleik7XG4gICAgb3V0WzEzXSA9IC0oeTAgKiBleWV4ICsgeTEgKiBleWV5ICsgeTIgKiBleWV6KTtcbiAgICBvdXRbMTRdID0gLSh6MCAqIGV5ZXggKyB6MSAqIGV5ZXkgKyB6MiAqIGV5ZXopO1xuICAgIG91dFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQ0J3NcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICAgIHZhciBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdLFxuICAgICAgICBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV0sXG4gICAgICAgIGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gICAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG4gICAgdmFyIGIwICA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107ICBcbiAgICBvdXRbMF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzFdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICAgIG91dFsyXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbiAgICBvdXRbM10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbNF07IGIxID0gYls1XTsgYjIgPSBiWzZdOyBiMyA9IGJbN107XG4gICAgb3V0WzRdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs1XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbNl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gICAgb3V0WzddID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gICAgYjAgPSBiWzhdOyBiMSA9IGJbOV07IGIyID0gYlsxMF07IGIzID0gYlsxMV07XG4gICAgb3V0WzhdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuICAgIG91dFs5XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTBdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxMV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgICBiMCA9IGJbMTJdOyBiMSA9IGJbMTNdOyBiMiA9IGJbMTRdOyBiMyA9IGJbMTVdO1xuICAgIG91dFsxMl0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gICAgb3V0WzEzXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgICBvdXRbMTRdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICAgIG91dFsxNV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBvcnRobztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBvcnRobyhvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpLFxuICAgICAgICBidCA9IDEgLyAoYm90dG9tIC0gdG9wKSxcbiAgICAgICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IC0yICogbHI7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSAtMiAqIGJ0O1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IDIgKiBuZjtcbiAgICBvdXRbMTFdID0gMDtcbiAgICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgICBvdXRbMTNdID0gKHRvcCArIGJvdHRvbSkgKiBidDtcbiAgICBvdXRbMTRdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzE1XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBwZXJzcGVjdGl2ZTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBib3VuZHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gZm92eSBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgQXNwZWN0IHJhdGlvLiB0eXBpY2FsbHkgdmlld3BvcnQgd2lkdGgvaGVpZ2h0XG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBwZXJzcGVjdGl2ZShvdXQsIGZvdnksIGFzcGVjdCwgbmVhciwgZmFyKSB7XG4gICAgdmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXG4gICAgICAgIG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICBvdXRbMF0gPSBmIC8gYXNwZWN0O1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IDA7XG4gICAgb3V0WzVdID0gZjtcbiAgICBvdXRbNl0gPSAwO1xuICAgIG91dFs3XSA9IDA7XG4gICAgb3V0WzhdID0gMDtcbiAgICBvdXRbOV0gPSAwO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTFdID0gLTE7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9ICgyICogZmFyICogbmVhcikgKiBuZjtcbiAgICBvdXRbMTVdID0gMDtcbiAgICByZXR1cm4gb3V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGZpZWxkIG9mIHZpZXcuXG4gKiBUaGlzIGlzIHByaW1hcmlseSB1c2VmdWwgZm9yIGdlbmVyYXRpbmcgcHJvamVjdGlvbiBtYXRyaWNlcyB0byBiZSB1c2VkXG4gKiB3aXRoIHRoZSBzdGlsbCBleHBlcmllbWVudGFsIFdlYlZSIEFQSS5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge251bWJlcn0gZm92IE9iamVjdCBjb250YWluaW5nIHRoZSBmb2xsb3dpbmcgdmFsdWVzOiB1cERlZ3JlZXMsIGRvd25EZWdyZWVzLCBsZWZ0RGVncmVlcywgcmlnaHREZWdyZWVzXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiBwZXJzcGVjdGl2ZUZyb21GaWVsZE9mVmlldyhvdXQsIGZvdiwgbmVhciwgZmFyKSB7XG4gICAgdmFyIHVwVGFuID0gTWF0aC50YW4oZm92LnVwRGVncmVlcyAqIE1hdGguUEkvMTgwLjApLFxuICAgICAgICBkb3duVGFuID0gTWF0aC50YW4oZm92LmRvd25EZWdyZWVzICogTWF0aC5QSS8xODAuMCksXG4gICAgICAgIGxlZnRUYW4gPSBNYXRoLnRhbihmb3YubGVmdERlZ3JlZXMgKiBNYXRoLlBJLzE4MC4wKSxcbiAgICAgICAgcmlnaHRUYW4gPSBNYXRoLnRhbihmb3YucmlnaHREZWdyZWVzICogTWF0aC5QSS8xODAuMCksXG4gICAgICAgIHhTY2FsZSA9IDIuMCAvIChsZWZ0VGFuICsgcmlnaHRUYW4pLFxuICAgICAgICB5U2NhbGUgPSAyLjAgLyAodXBUYW4gKyBkb3duVGFuKTtcblxuICAgIG91dFswXSA9IHhTY2FsZTtcbiAgICBvdXRbMV0gPSAwLjA7XG4gICAgb3V0WzJdID0gMC4wO1xuICAgIG91dFszXSA9IDAuMDtcbiAgICBvdXRbNF0gPSAwLjA7XG4gICAgb3V0WzVdID0geVNjYWxlO1xuICAgIG91dFs2XSA9IDAuMDtcbiAgICBvdXRbN10gPSAwLjA7XG4gICAgb3V0WzhdID0gLSgobGVmdFRhbiAtIHJpZ2h0VGFuKSAqIHhTY2FsZSAqIDAuNSk7XG4gICAgb3V0WzldID0gKCh1cFRhbiAtIGRvd25UYW4pICogeVNjYWxlICogMC41KTtcbiAgICBvdXRbMTBdID0gZmFyIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFsxMV0gPSAtMS4wO1xuICAgIG91dFsxMl0gPSAwLjA7XG4gICAgb3V0WzEzXSA9IDAuMDtcbiAgICBvdXRbMTRdID0gKGZhciAqIG5lYXIpIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFsxNV0gPSAwLjA7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSByb3RhdGU7XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDQgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCwgYXhpcykge1xuICAgIHZhciB4ID0gYXhpc1swXSwgeSA9IGF4aXNbMV0sIHogPSBheGlzWzJdLFxuICAgICAgICBsZW4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KSxcbiAgICAgICAgcywgYywgdCxcbiAgICAgICAgYTAwLCBhMDEsIGEwMiwgYTAzLFxuICAgICAgICBhMTAsIGExMSwgYTEyLCBhMTMsXG4gICAgICAgIGEyMCwgYTIxLCBhMjIsIGEyMyxcbiAgICAgICAgYjAwLCBiMDEsIGIwMixcbiAgICAgICAgYjEwLCBiMTEsIGIxMixcbiAgICAgICAgYjIwLCBiMjEsIGIyMjtcblxuICAgIGlmIChNYXRoLmFicyhsZW4pIDwgMC4wMDAwMDEpIHsgcmV0dXJuIG51bGw7IH1cbiAgICBcbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHggKj0gbGVuO1xuICAgIHkgKj0gbGVuO1xuICAgIHogKj0gbGVuO1xuXG4gICAgcyA9IE1hdGguc2luKHJhZCk7XG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG4gICAgdCA9IDEgLSBjO1xuXG4gICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xuICAgIGEyMCA9IGFbOF07IGEyMSA9IGFbOV07IGEyMiA9IGFbMTBdOyBhMjMgPSBhWzExXTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuICAgIGIwMCA9IHggKiB4ICogdCArIGM7IGIwMSA9IHkgKiB4ICogdCArIHogKiBzOyBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgICBiMTAgPSB4ICogeSAqIHQgLSB6ICogczsgYjExID0geSAqIHkgKiB0ICsgYzsgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XG4gICAgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzOyBiMjIgPSB6ICogeiAqIHQgKyBjO1xuXG4gICAgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgICBvdXRbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDI7XG4gICAgb3V0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICBvdXRbM10gPSBhMDMgKiBiMDAgKyBhMTMgKiBiMDEgKyBhMjMgKiBiMDI7XG4gICAgb3V0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICBvdXRbNl0gPSBhMDIgKiBiMTAgKyBhMTIgKiBiMTEgKyBhMjIgKiBiMTI7XG4gICAgb3V0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICAgIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICBvdXRbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjI7XG4gICAgb3V0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcm90YXRlWDtcblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCByYWQpIHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMTAgPSBhWzRdLFxuICAgICAgICBhMTEgPSBhWzVdLFxuICAgICAgICBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddLFxuICAgICAgICBhMjAgPSBhWzhdLFxuICAgICAgICBhMjEgPSBhWzldLFxuICAgICAgICBhMjIgPSBhWzEwXSxcbiAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICAgICAgb3V0WzBdICA9IGFbMF07XG4gICAgICAgIG91dFsxXSAgPSBhWzFdO1xuICAgICAgICBvdXRbMl0gID0gYVsyXTtcbiAgICAgICAgb3V0WzNdICA9IGFbM107XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzRdID0gYTEwICogYyArIGEyMCAqIHM7XG4gICAgb3V0WzVdID0gYTExICogYyArIGEyMSAqIHM7XG4gICAgb3V0WzZdID0gYTEyICogYyArIGEyMiAqIHM7XG4gICAgb3V0WzddID0gYTEzICogYyArIGEyMyAqIHM7XG4gICAgb3V0WzhdID0gYTIwICogYyAtIGExMCAqIHM7XG4gICAgb3V0WzldID0gYTIxICogYyAtIGExMSAqIHM7XG4gICAgb3V0WzEwXSA9IGEyMiAqIGMgLSBhMTIgKiBzO1xuICAgIG91dFsxMV0gPSBhMjMgKiBjIC0gYTEzICogcztcbiAgICByZXR1cm4gb3V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJvdGF0ZVk7XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgcmFkKSB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTAwID0gYVswXSxcbiAgICAgICAgYTAxID0gYVsxXSxcbiAgICAgICAgYTAyID0gYVsyXSxcbiAgICAgICAgYTAzID0gYVszXSxcbiAgICAgICAgYTIwID0gYVs4XSxcbiAgICAgICAgYTIxID0gYVs5XSxcbiAgICAgICAgYTIyID0gYVsxMF0sXG4gICAgICAgIGEyMyA9IGFbMTFdO1xuXG4gICAgaWYgKGEgIT09IG91dCkgeyAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCByb3dzXG4gICAgICAgIG91dFs0XSAgPSBhWzRdO1xuICAgICAgICBvdXRbNV0gID0gYVs1XTtcbiAgICAgICAgb3V0WzZdICA9IGFbNl07XG4gICAgICAgIG91dFs3XSAgPSBhWzddO1xuICAgICAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgfVxuXG4gICAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICAgIG91dFswXSA9IGEwMCAqIGMgLSBhMjAgKiBzO1xuICAgIG91dFsxXSA9IGEwMSAqIGMgLSBhMjEgKiBzO1xuICAgIG91dFsyXSA9IGEwMiAqIGMgLSBhMjIgKiBzO1xuICAgIG91dFszXSA9IGEwMyAqIGMgLSBhMjMgKiBzO1xuICAgIG91dFs4XSA9IGEwMCAqIHMgKyBhMjAgKiBjO1xuICAgIG91dFs5XSA9IGEwMSAqIHMgKyBhMjEgKiBjO1xuICAgIG91dFsxMF0gPSBhMDIgKiBzICsgYTIyICogYztcbiAgICBvdXRbMTFdID0gYTAzICogcyArIGEyMyAqIGM7XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByb3RhdGVaO1xuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIHJhZCkge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IGFbMF0sXG4gICAgICAgIGEwMSA9IGFbMV0sXG4gICAgICAgIGEwMiA9IGFbMl0sXG4gICAgICAgIGEwMyA9IGFbM10sXG4gICAgICAgIGExMCA9IGFbNF0sXG4gICAgICAgIGExMSA9IGFbNV0sXG4gICAgICAgIGExMiA9IGFbNl0sXG4gICAgICAgIGExMyA9IGFbN107XG5cbiAgICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIGxhc3Qgcm93XG4gICAgICAgIG91dFs4XSAgPSBhWzhdO1xuICAgICAgICBvdXRbOV0gID0gYVs5XTtcbiAgICAgICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgICAgICBvdXRbMTFdID0gYVsxMV07XG4gICAgICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICAgICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgICAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG5cbiAgICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gICAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHM7XG4gICAgb3V0WzFdID0gYTAxICogYyArIGExMSAqIHM7XG4gICAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHM7XG4gICAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHM7XG4gICAgb3V0WzRdID0gYTEwICogYyAtIGEwMCAqIHM7XG4gICAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHM7XG4gICAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHM7XG4gICAgb3V0WzddID0gYTEzICogYyAtIGEwMyAqIHM7XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBzY2FsZTtcblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7dmVjM30gdiB0aGUgdmVjMyB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKiovXG5mdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXTtcblxuICAgIG91dFswXSA9IGFbMF0gKiB4O1xuICAgIG91dFsxXSA9IGFbMV0gKiB4O1xuICAgIG91dFsyXSA9IGFbMl0gKiB4O1xuICAgIG91dFszXSA9IGFbM10gKiB4O1xuICAgIG91dFs0XSA9IGFbNF0gKiB5O1xuICAgIG91dFs1XSA9IGFbNV0gKiB5O1xuICAgIG91dFs2XSA9IGFbNl0gKiB5O1xuICAgIG91dFs3XSA9IGFbN10gKiB5O1xuICAgIG91dFs4XSA9IGFbOF0gKiB6O1xuICAgIG91dFs5XSA9IGFbOV0gKiB6O1xuICAgIG91dFsxMF0gPSBhWzEwXSAqIHo7XG4gICAgb3V0WzExXSA9IGFbMTFdICogejtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBzdHI7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG1hdCBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5mdW5jdGlvbiBzdHIoYSkge1xuICAgIHJldHVybiAnbWF0NCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcsICcgK1xuICAgICAgICAgICAgICAgICAgICBhWzRdICsgJywgJyArIGFbNV0gKyAnLCAnICsgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArXG4gICAgICAgICAgICAgICAgICAgIGFbOF0gKyAnLCAnICsgYVs5XSArICcsICcgKyBhWzEwXSArICcsICcgKyBhWzExXSArICcsICcgKyBcbiAgICAgICAgICAgICAgICAgICAgYVsxMl0gKyAnLCAnICsgYVsxM10gKyAnLCAnICsgYVsxNF0gKyAnLCAnICsgYVsxNV0gKyAnKSc7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gdHJhbnNsYXRlO1xuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjM30gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXSxcbiAgICAgICAgYTAwLCBhMDEsIGEwMiwgYTAzLFxuICAgICAgICBhMTAsIGExMSwgYTEyLCBhMTMsXG4gICAgICAgIGEyMCwgYTIxLCBhMjIsIGEyMztcblxuICAgIGlmIChhID09PSBvdXQpIHtcbiAgICAgICAgb3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdO1xuICAgICAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgICAgIG91dFsxNF0gPSBhWzJdICogeCArIGFbNl0gKiB5ICsgYVsxMF0gKiB6ICsgYVsxNF07XG4gICAgICAgIG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYTAwID0gYVswXTsgYTAxID0gYVsxXTsgYTAyID0gYVsyXTsgYTAzID0gYVszXTtcbiAgICAgICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICAgICAgYTIwID0gYVs4XTsgYTIxID0gYVs5XTsgYTIyID0gYVsxMF07IGEyMyA9IGFbMTFdO1xuXG4gICAgICAgIG91dFswXSA9IGEwMDsgb3V0WzFdID0gYTAxOyBvdXRbMl0gPSBhMDI7IG91dFszXSA9IGEwMztcbiAgICAgICAgb3V0WzRdID0gYTEwOyBvdXRbNV0gPSBhMTE7IG91dFs2XSA9IGExMjsgb3V0WzddID0gYTEzO1xuICAgICAgICBvdXRbOF0gPSBhMjA7IG91dFs5XSA9IGEyMTsgb3V0WzEwXSA9IGEyMjsgb3V0WzExXSA9IGEyMztcblxuICAgICAgICBvdXRbMTJdID0gYTAwICogeCArIGExMCAqIHkgKyBhMjAgKiB6ICsgYVsxMl07XG4gICAgICAgIG91dFsxM10gPSBhMDEgKiB4ICsgYTExICogeSArIGEyMSAqIHogKyBhWzEzXTtcbiAgICAgICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgICAgICBvdXRbMTVdID0gYTAzICogeCArIGExMyAqIHkgKyBhMjMgKiB6ICsgYVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB0cmFuc3Bvc2U7XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5mdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XG4gICAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICAgIGlmIChvdXQgPT09IGEpIHtcbiAgICAgICAgdmFyIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4gICAgICAgICAgICBhMTIgPSBhWzZdLCBhMTMgPSBhWzddLFxuICAgICAgICAgICAgYTIzID0gYVsxMV07XG5cbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGEwMTtcbiAgICAgICAgb3V0WzZdID0gYVs5XTtcbiAgICAgICAgb3V0WzddID0gYVsxM107XG4gICAgICAgIG91dFs4XSA9IGEwMjtcbiAgICAgICAgb3V0WzldID0gYTEyO1xuICAgICAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgICAgIG91dFsxMl0gPSBhMDM7XG4gICAgICAgIG91dFsxM10gPSBhMTM7XG4gICAgICAgIG91dFsxNF0gPSBhMjM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3V0WzBdID0gYVswXTtcbiAgICAgICAgb3V0WzFdID0gYVs0XTtcbiAgICAgICAgb3V0WzJdID0gYVs4XTtcbiAgICAgICAgb3V0WzNdID0gYVsxMl07XG4gICAgICAgIG91dFs0XSA9IGFbMV07XG4gICAgICAgIG91dFs1XSA9IGFbNV07XG4gICAgICAgIG91dFs2XSA9IGFbOV07XG4gICAgICAgIG91dFs3XSA9IGFbMTNdO1xuICAgICAgICBvdXRbOF0gPSBhWzJdO1xuICAgICAgICBvdXRbOV0gPSBhWzZdO1xuICAgICAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgICAgIG91dFsxMV0gPSBhWzE0XTtcbiAgICAgICAgb3V0WzEyXSA9IGFbM107XG4gICAgICAgIG91dFsxM10gPSBhWzddO1xuICAgICAgICBvdXRbMTRdID0gYVsxMV07XG4gICAgICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dDtcbn07IiwiLyogZ2xvYmFsIFhNTEh0dHBSZXF1ZXN0ICovXG52YXIgY29uZmlnUGFyYW1ldGVycyA9IFtcbiAgJ21hbmlmZXN0JyxcbiAgJ29uRG9uZScsXG4gICdvblByb2dyZXNzJyxcbiAgJ29uRXJyb3InXG5dXG5cbnZhciBtYW5pZmVzdFBhcmFtZXRlcnMgPSBbXG4gICd0eXBlJyxcbiAgJ3NyYycsXG4gICdzdHJlYW0nLFxuICAnY3JlZGVudGlhbHMnLFxuICAncGFyc2VyJ1xuXVxuXG52YXIgcGFyc2VyUGFyYW1ldGVycyA9IFtcbiAgJ29uRGF0YScsXG4gICdvbkRvbmUnXG5dXG5cbnZhciBTVEFURV9FUlJPUiA9IC0xXG52YXIgU1RBVEVfREFUQSA9IDBcbnZhciBTVEFURV9DT01QTEVURSA9IDFcblxuZnVuY3Rpb24gcmFpc2UgKG1lc3NhZ2UpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdyZXNsOiAnICsgbWVzc2FnZSlcbn1cblxuZnVuY3Rpb24gY2hlY2tUeXBlIChvYmplY3QsIHBhcmFtZXRlcnMsIG5hbWUpIHtcbiAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGZ1bmN0aW9uIChwYXJhbSkge1xuICAgIGlmIChwYXJhbWV0ZXJzLmluZGV4T2YocGFyYW0pIDwgMCkge1xuICAgICAgcmFpc2UoJ2ludmFsaWQgcGFyYW1ldGVyIFwiJyArIHBhcmFtICsgJ1wiIGluICcgKyBuYW1lKVxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gTG9hZGVyIChuYW1lLCBjYW5jZWwpIHtcbiAgdGhpcy5zdGF0ZSA9IFNUQVRFX0RBVEFcbiAgdGhpcy5yZWFkeSA9IGZhbHNlXG4gIHRoaXMucHJvZ3Jlc3MgPSAwXG4gIHRoaXMubmFtZSA9IG5hbWVcbiAgdGhpcy5jYW5jZWwgPSBjYW5jZWxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXNsIChjb25maWcpIHtcbiAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdvYmplY3QnIHx8ICFjb25maWcpIHtcbiAgICByYWlzZSgnaW52YWxpZCBvciBtaXNzaW5nIGNvbmZpZ3VyYXRpb24nKVxuICB9XG5cbiAgY2hlY2tUeXBlKGNvbmZpZywgY29uZmlnUGFyYW1ldGVycywgJ2NvbmZpZycpXG5cbiAgdmFyIG1hbmlmZXN0ID0gY29uZmlnLm1hbmlmZXN0XG4gIGlmICh0eXBlb2YgbWFuaWZlc3QgIT09ICdvYmplY3QnIHx8ICFtYW5pZmVzdCkge1xuICAgIHJhaXNlKCdtaXNzaW5nIG1hbmlmZXN0JylcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEZ1bmN0aW9uIChuYW1lLCBkZmx0KSB7XG4gICAgaWYgKG5hbWUgaW4gY29uZmlnKSB7XG4gICAgICB2YXIgZnVuYyA9IGNvbmZpZ1tuYW1lXVxuICAgICAgaWYgKHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJhaXNlKCdpbnZhbGlkIGNhbGxiYWNrIFwiJyArIG5hbWUgKyAnXCInKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmNcbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHZhciBvbkRvbmUgPSBnZXRGdW5jdGlvbignb25Eb25lJylcbiAgaWYgKCFvbkRvbmUpIHtcbiAgICByYWlzZSgnbWlzc2luZyBvbkRvbmUoKSBjYWxsYmFjaycpXG4gIH1cblxuICB2YXIgb25Qcm9ncmVzcyA9IGdldEZ1bmN0aW9uKCdvblByb2dyZXNzJylcbiAgdmFyIG9uRXJyb3IgPSBnZXRGdW5jdGlvbignb25FcnJvcicpXG5cbiAgdmFyIGFzc2V0cyA9IHt9XG5cbiAgdmFyIHN0YXRlID0gU1RBVEVfREFUQVxuXG4gIGZ1bmN0aW9uIGxvYWRYSFIgKHJlcXVlc3QpIHtcbiAgICB2YXIgbmFtZSA9IHJlcXVlc3QubmFtZVxuICAgIHZhciBzdHJlYW0gPSByZXF1ZXN0LnN0cmVhbVxuICAgIHZhciBiaW5hcnkgPSByZXF1ZXN0LnR5cGUgPT09ICdiaW5hcnknXG4gICAgdmFyIHBhcnNlciA9IHJlcXVlc3QucGFyc2VyXG5cbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB2YXIgYXNzZXQgPSBudWxsXG5cbiAgICB2YXIgbG9hZGVyID0gbmV3IExvYWRlcihuYW1lLCBjYW5jZWwpXG5cbiAgICBpZiAoc3RyZWFtKSB7XG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gb25SZWFkeVN0YXRlQ2hhbmdlXG4gICAgfSBlbHNlIHtcbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgIG9uUmVhZHlTdGF0ZUNoYW5nZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYmluYXJ5KSB7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJ1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uUmVhZHlTdGF0ZUNoYW5nZSAoKSB7XG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPCAyIHx8XG4gICAgICAgICAgbG9hZGVyLnN0YXRlID09PSBTVEFURV9DT01QTEVURSB8fFxuICAgICAgICAgIGxvYWRlci5zdGF0ZSA9PT0gU1RBVEVfRVJST1IpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoeGhyLnN0YXR1cyAhPT0gMjAwKSB7XG4gICAgICAgIHJldHVybiBhYm9ydCgnZXJyb3IgbG9hZGluZyByZXNvdXJjZSBcIicgKyByZXF1ZXN0Lm5hbWUgKyAnXCInKVxuICAgICAgfVxuICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID4gMiAmJiBsb2FkZXIuc3RhdGUgPT09IFNUQVRFX0RBVEEpIHtcbiAgICAgICAgdmFyIHJlc3BvbnNlXG4gICAgICAgIGlmIChyZXF1ZXN0LnR5cGUgPT09ICdiaW5hcnknKSB7XG4gICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNwb25zZSA9IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyc2VyLmRhdGEpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXNzZXQgPSBwYXJzZXIuZGF0YShyZXNwb25zZSlcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gYWJvcnQoZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXNzZXQgPSByZXNwb25zZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPiAzICYmIGxvYWRlci5zdGF0ZSA9PT0gU1RBVEVfREFUQSkge1xuICAgICAgICBpZiAocGFyc2VyLmRvbmUpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXNzZXQgPSBwYXJzZXIuZG9uZSgpXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGFib3J0KGUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxvYWRlci5zdGF0ZSA9IFNUQVRFX0NPTVBMRVRFXG4gICAgICB9XG4gICAgICBhc3NldHNbbmFtZV0gPSBhc3NldFxuICAgICAgbG9hZGVyLnByb2dyZXNzID0gMC43NSAqIGxvYWRlci5wcm9ncmVzcyArIDAuMjVcbiAgICAgIGxvYWRlci5yZWFkeSA9XG4gICAgICAgIChyZXF1ZXN0LnN0cmVhbSAmJiAhIWFzc2V0KSB8fFxuICAgICAgICBsb2FkZXIuc3RhdGUgPT09IFNUQVRFX0NPTVBMRVRFXG4gICAgICBub3RpZnlQcm9ncmVzcygpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsICgpIHtcbiAgICAgIGlmIChsb2FkZXIuc3RhdGUgPT09IFNUQVRFX0NPTVBMRVRFIHx8IGxvYWRlci5zdGF0ZSA9PT0gU1RBVEVfRVJST1IpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbFxuICAgICAgeGhyLmFib3J0KClcbiAgICAgIGxvYWRlci5zdGF0ZSA9IFNUQVRFX0VSUk9SXG4gICAgfVxuXG4gICAgLy8gc2V0IHVwIHJlcXVlc3RcbiAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscykge1xuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICB9XG4gICAgeGhyLm9wZW4oJ0dFVCcsIHJlcXVlc3Quc3JjLCB0cnVlKVxuICAgIHhoci5zZW5kKClcblxuICAgIHJldHVybiBsb2FkZXJcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRFbGVtZW50IChyZXF1ZXN0LCBlbGVtZW50KSB7XG4gICAgdmFyIG5hbWUgPSByZXF1ZXN0Lm5hbWVcbiAgICB2YXIgcGFyc2VyID0gcmVxdWVzdC5wYXJzZXJcblxuICAgIHZhciBsb2FkZXIgPSBuZXcgTG9hZGVyKG5hbWUsIGNhbmNlbClcbiAgICB2YXIgYXNzZXQgPSBlbGVtZW50XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVQcm9ncmVzcyAoKSB7XG4gICAgICBpZiAobG9hZGVyLnN0YXRlID09PSBTVEFURV9EQVRBKSB7XG4gICAgICAgIGlmIChwYXJzZXIuZGF0YSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhc3NldCA9IHBhcnNlci5kYXRhKGVsZW1lbnQpXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGFib3J0KGUpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFzc2V0ID0gZWxlbWVudFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Qcm9ncmVzcyAoZSkge1xuICAgICAgaGFuZGxlUHJvZ3Jlc3MoKVxuICAgICAgYXNzZXRzW25hbWVdID0gYXNzZXRcbiAgICAgIGlmIChlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgbG9hZGVyLnByb2dyZXNzID0gTWF0aC5tYXgobG9hZGVyLnByb2dyZXNzLCBlLmxvYWRlZCAvIGUudG90YWwpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2FkZXIucHJvZ3Jlc3MgPSAwLjc1ICogbG9hZGVyLnByb2dyZXNzICsgMC4yNVxuICAgICAgfVxuICAgICAgbG9hZGVyLnJlYWR5ID0gcmVxdWVzdC5zdHJlYW1cbiAgICAgIG5vdGlmeVByb2dyZXNzKG5hbWUpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Db21wbGV0ZSAoKSB7XG4gICAgICBoYW5kbGVQcm9ncmVzcygpXG4gICAgICBpZiAobG9hZGVyLnN0YXRlID09PSBTVEFURV9EQVRBKSB7XG4gICAgICAgIGlmIChwYXJzZXIuZG9uZSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhc3NldCA9IHBhcnNlci5kb25lKClcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gYWJvcnQoZSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbG9hZGVyLnN0YXRlID0gU1RBVEVfQ09NUExFVEVcbiAgICAgIH1cbiAgICAgIGxvYWRlci5wcm9ncmVzcyA9IDFcbiAgICAgIGxvYWRlci5yZWFkeSA9IHRydWVcbiAgICAgIGFzc2V0c1tuYW1lXSA9IGFzc2V0XG4gICAgICByZW1vdmVMaXN0ZW5lcnMoKVxuICAgICAgbm90aWZ5UHJvZ3Jlc3MoJ2ZpbmlzaCAnICsgbmFtZSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkVycm9yICgpIHtcbiAgICAgIGFib3J0KCdlcnJvciBsb2FkaW5nIGFzc2V0IFwiJyArIG5hbWUgKyAnXCInKVxuICAgIH1cblxuICAgIGlmIChyZXF1ZXN0LnN0cmVhbSkge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uUHJvZ3Jlc3MpXG4gICAgfVxuICAgIGlmIChyZXF1ZXN0LnR5cGUgPT09ICdpbWFnZScpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uQ29tcGxldGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ29tcGxldGUpXG4gICAgfVxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXJzICgpIHtcbiAgICAgIGlmIChyZXF1ZXN0LnN0cmVhbSkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Qcm9ncmVzcylcbiAgICAgIH1cbiAgICAgIGlmIChyZXF1ZXN0LnR5cGUgPT09ICdpbWFnZScpIHtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Db21wbGV0ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheScsIG9uQ29tcGxldGUpXG4gICAgICB9XG4gICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcilcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWwgKCkge1xuICAgICAgaWYgKGxvYWRlci5zdGF0ZSA9PT0gU1RBVEVfQ09NUExFVEUgfHwgbG9hZGVyLnN0YXRlID09PSBTVEFURV9FUlJPUikge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGxvYWRlci5zdGF0ZSA9IFNUQVRFX0VSUk9SXG4gICAgICByZW1vdmVMaXN0ZW5lcnMoKVxuICAgICAgZWxlbWVudC5zcmMgPSAnJ1xuICAgIH1cblxuICAgIC8vIHNldCB1cCByZXF1ZXN0XG4gICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMpIHtcbiAgICAgIGVsZW1lbnQuY3Jvc3NPcmlnaW4gPSAndXNlLWNyZWRlbnRpYWxzJ1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LmNyb3NzT3JpZ2luID0gJ2Fub255bW91cydcbiAgICB9XG4gICAgZWxlbWVudC5zcmMgPSByZXF1ZXN0LnNyY1xuXG4gICAgcmV0dXJuIGxvYWRlclxuICB9XG5cbiAgdmFyIGxvYWRlcnMgPSB7XG4gICAgdGV4dDogbG9hZFhIUixcbiAgICBiaW5hcnk6IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgICAvLyBUT0RPIHVzZSBmZXRjaCBBUEkgZm9yIHN0cmVhbWluZyBpZiBzdXBwb3J0ZWRcbiAgICAgIHJldHVybiBsb2FkWEhSKHJlcXVlc3QpXG4gICAgfSxcbiAgICBpbWFnZTogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgIHJldHVybiBsb2FkRWxlbWVudChyZXF1ZXN0LCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKSlcbiAgICB9LFxuICAgIHZpZGVvOiBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgICAgcmV0dXJuIGxvYWRFbGVtZW50KHJlcXVlc3QsIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJykpXG4gICAgfSxcbiAgICBhdWRpbzogZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICAgIHJldHVybiBsb2FkRWxlbWVudChyZXF1ZXN0LCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpKVxuICAgIH1cbiAgfVxuXG4gIC8vIEZpcnN0IHdlIHBhcnNlIGFsbCBvYmplY3RzIGluIG9yZGVyIHRvIHZlcmlmeSB0aGF0IGFsbCB0eXBlIGluZm9ybWF0aW9uXG4gIC8vIGlzIGNvcnJlY3RcbiAgdmFyIHBlbmRpbmcgPSBPYmplY3Qua2V5cyhtYW5pZmVzdCkubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHJlcXVlc3QgPSBtYW5pZmVzdFtuYW1lXVxuICAgIGlmICh0eXBlb2YgcmVxdWVzdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJlcXVlc3QgPSB7XG4gICAgICAgIHNyYzogcmVxdWVzdFxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlcXVlc3QgIT09ICdvYmplY3QnIHx8ICFyZXF1ZXN0KSB7XG4gICAgICByYWlzZSgnaW52YWxpZCBhc3NldCBkZWZpbml0aW9uIFwiJyArIG5hbWUgKyAnXCInKVxuICAgIH1cblxuICAgIGNoZWNrVHlwZShyZXF1ZXN0LCBtYW5pZmVzdFBhcmFtZXRlcnMsICdhc3NldCBcIicgKyBuYW1lICsgJ1wiJylcblxuICAgIGZ1bmN0aW9uIGdldFBhcmFtZXRlciAocHJvcCwgYWNjZXB0ZWQsIGluaXQpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGluaXRcbiAgICAgIGlmIChwcm9wIGluIHJlcXVlc3QpIHtcbiAgICAgICAgdmFsdWUgPSByZXF1ZXN0W3Byb3BdXG4gICAgICB9XG4gICAgICBpZiAoYWNjZXB0ZWQuaW5kZXhPZih2YWx1ZSkgPCAwKSB7XG4gICAgICAgIHJhaXNlKCdpbnZhbGlkICcgKyBwcm9wICsgJyBcIicgKyB2YWx1ZSArICdcIiBmb3IgYXNzZXQgXCInICsgbmFtZSArICdcIiwgcG9zc2libGUgdmFsdWVzOiAnICsgYWNjZXB0ZWQpXG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTdHJpbmcgKHByb3AsIHJlcXVpcmVkLCBpbml0KSB7XG4gICAgICB2YXIgdmFsdWUgPSBpbml0XG4gICAgICBpZiAocHJvcCBpbiByZXF1ZXN0KSB7XG4gICAgICAgIHZhbHVlID0gcmVxdWVzdFtwcm9wXVxuICAgICAgfSBlbHNlIGlmIChyZXF1aXJlZCkge1xuICAgICAgICByYWlzZSgnbWlzc2luZyAnICsgcHJvcCArICcgZm9yIGFzc2V0IFwiJyArIG5hbWUgKyAnXCInKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmFpc2UoJ2ludmFsaWQgJyArIHByb3AgKyAnIGZvciBhc3NldCBcIicgKyBuYW1lICsgJ1wiLCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFBhcnNlRnVuYyAobmFtZSwgZGZsdCkge1xuICAgICAgaWYgKG5hbWUgaW4gcmVxdWVzdC5wYXJzZXIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlcXVlc3QucGFyc2VyW25hbWVdXG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcmFpc2UoJ2ludmFsaWQgcGFyc2VyIGNhbGxiYWNrICcgKyBuYW1lICsgJyBmb3IgYXNzZXQgXCInICsgbmFtZSArICdcIicpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGRmbHRcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcGFyc2VyID0ge31cbiAgICBpZiAoJ3BhcnNlcicgaW4gcmVxdWVzdCkge1xuICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0LnBhcnNlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwYXJzZXIgPSB7XG4gICAgICAgICAgZGF0YTogcmVxdWVzdC5wYXJzZXJcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWVzdC5wYXJzZXIgPT09ICdvYmplY3QnICYmIHJlcXVlc3QucGFyc2VyKSB7XG4gICAgICAgIGNoZWNrVHlwZShwYXJzZXIsIHBhcnNlclBhcmFtZXRlcnMsICdwYXJzZXIgZm9yIGFzc2V0IFwiJyArIG5hbWUgKyAnXCInKVxuICAgICAgICBpZiAoISgnb25EYXRhJyBpbiBwYXJzZXIpKSB7XG4gICAgICAgICAgcmFpc2UoJ21pc3Npbmcgb25EYXRhIGNhbGxiYWNrIGZvciBwYXJzZXIgaW4gYXNzZXQgXCInICsgbmFtZSArICdcIicpXG4gICAgICAgIH1cbiAgICAgICAgcGFyc2VyID0ge1xuICAgICAgICAgIGRhdGE6IGdldFBhcnNlRnVuYygnb25EYXRhJyksXG4gICAgICAgICAgZG9uZTogZ2V0UGFyc2VGdW5jKCdvbkRvbmUnKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByYWlzZSgnaW52YWxpZCBwYXJzZXIgZm9yIGFzc2V0IFwiJyArIG5hbWUgKyAnXCInKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgdHlwZTogZ2V0UGFyYW1ldGVyKCd0eXBlJywgT2JqZWN0LmtleXMobG9hZGVycyksICd0ZXh0JyksXG4gICAgICBzdHJlYW06ICEhcmVxdWVzdC5zdHJlYW0sXG4gICAgICBjcmVkZW50aWFsczogISFyZXF1ZXN0LmNyZWRlbnRpYWxzLFxuICAgICAgc3JjOiBnZXRTdHJpbmcoJ3NyYycsIHRydWUsICcnKSxcbiAgICAgIHBhcnNlcjogcGFyc2VyXG4gICAgfVxuICB9KS5tYXAoZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgICByZXR1cm4gKGxvYWRlcnNbcmVxdWVzdC50eXBlXSkocmVxdWVzdClcbiAgfSlcblxuICBmdW5jdGlvbiBhYm9ydCAobWVzc2FnZSkge1xuICAgIGlmIChzdGF0ZSA9PT0gU1RBVEVfRVJST1IgfHwgc3RhdGUgPT09IFNUQVRFX0NPTVBMRVRFKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc3RhdGUgPSBTVEFURV9FUlJPUlxuICAgIHBlbmRpbmcuZm9yRWFjaChmdW5jdGlvbiAobG9hZGVyKSB7XG4gICAgICBsb2FkZXIuY2FuY2VsKClcbiAgICB9KVxuICAgIGlmIChvbkVycm9yKSB7XG4gICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG9uRXJyb3IobmV3IEVycm9yKCdyZXNsOiAnICsgbWVzc2FnZSkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvbkVycm9yKG1lc3NhZ2UpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ3Jlc2wgZXJyb3I6JywgbWVzc2FnZSlcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3RpZnlQcm9ncmVzcyAobWVzc2FnZSkge1xuICAgIGlmIChzdGF0ZSA9PT0gU1RBVEVfRVJST1IgfHwgc3RhdGUgPT09IFNUQVRFX0NPTVBMRVRFKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgcHJvZ3Jlc3MgPSAwXG4gICAgdmFyIG51bVJlYWR5ID0gMFxuICAgIHBlbmRpbmcuZm9yRWFjaChmdW5jdGlvbiAobG9hZGVyKSB7XG4gICAgICBpZiAobG9hZGVyLnJlYWR5KSB7XG4gICAgICAgIG51bVJlYWR5ICs9IDFcbiAgICAgIH1cbiAgICAgIHByb2dyZXNzICs9IGxvYWRlci5wcm9ncmVzc1xuICAgIH0pXG5cbiAgICBpZiAobnVtUmVhZHkgPT09IHBlbmRpbmcubGVuZ3RoKSB7XG4gICAgICBzdGF0ZSA9IFNUQVRFX0NPTVBMRVRFXG4gICAgICBvbkRvbmUoYXNzZXRzKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAob25Qcm9ncmVzcykge1xuICAgICAgICBvblByb2dyZXNzKHByb2dyZXNzIC8gcGVuZGluZy5sZW5ndGgsIG1lc3NhZ2UpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJcbnZhciBleHRlbmQgPSByZXF1aXJlKCcuL2xpYi91dGlsL2V4dGVuZCcpXG52YXIgZHluYW1pYyA9IHJlcXVpcmUoJy4vbGliL2R5bmFtaWMnKVxudmFyIHJhZiA9IHJlcXVpcmUoJy4vbGliL3V0aWwvcmFmJylcbnZhciBjbG9jayA9IHJlcXVpcmUoJy4vbGliL3V0aWwvY2xvY2snKVxudmFyIGNyZWF0ZVN0cmluZ1N0b3JlID0gcmVxdWlyZSgnLi9saWIvc3RyaW5ncycpXG52YXIgaW5pdFdlYkdMID0gcmVxdWlyZSgnLi9saWIvd2ViZ2wnKVxudmFyIHdyYXBFeHRlbnNpb25zID0gcmVxdWlyZSgnLi9saWIvZXh0ZW5zaW9uJylcbnZhciB3cmFwTGltaXRzID0gcmVxdWlyZSgnLi9saWIvbGltaXRzJylcbnZhciB3cmFwQnVmZmVycyA9IHJlcXVpcmUoJy4vbGliL2J1ZmZlcicpXG52YXIgd3JhcEVsZW1lbnRzID0gcmVxdWlyZSgnLi9saWIvZWxlbWVudHMnKVxudmFyIHdyYXBUZXh0dXJlcyA9IHJlcXVpcmUoJy4vbGliL3RleHR1cmUnKVxudmFyIHdyYXBSZW5kZXJidWZmZXJzID0gcmVxdWlyZSgnLi9saWIvcmVuZGVyYnVmZmVyJylcbnZhciB3cmFwRnJhbWVidWZmZXJzID0gcmVxdWlyZSgnLi9saWIvZnJhbWVidWZmZXInKVxudmFyIHdyYXBBdHRyaWJ1dGVzID0gcmVxdWlyZSgnLi9saWIvYXR0cmlidXRlJylcbnZhciB3cmFwU2hhZGVycyA9IHJlcXVpcmUoJy4vbGliL3NoYWRlcicpXG52YXIgd3JhcFJlYWQgPSByZXF1aXJlKCcuL2xpYi9yZWFkJylcbnZhciBjcmVhdGVDb3JlID0gcmVxdWlyZSgnLi9saWIvY29yZScpXG52YXIgY3JlYXRlU3RhdHMgPSByZXF1aXJlKCcuL2xpYi9zdGF0cycpXG52YXIgY3JlYXRlVGltZXIgPSByZXF1aXJlKCcuL2xpYi90aW1lcicpXG5cbnZhciBHTF9DT0xPUl9CVUZGRVJfQklUID0gMTYzODRcbnZhciBHTF9ERVBUSF9CVUZGRVJfQklUID0gMjU2XG52YXIgR0xfU1RFTkNJTF9CVUZGRVJfQklUID0gMTAyNFxuXG52YXIgR0xfQVJSQVlfQlVGRkVSID0gMzQ5NjJcblxudmFyIENPTlRFWFRfTE9TVF9FVkVOVCA9ICd3ZWJnbGNvbnRleHRsb3N0J1xudmFyIENPTlRFWFRfUkVTVE9SRURfRVZFTlQgPSAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnXG5cbnZhciBEWU5fUFJPUCA9IDFcbnZhciBEWU5fQ09OVEVYVCA9IDJcbnZhciBEWU5fU1RBVEUgPSAzXG5cbmZ1bmN0aW9uIGZpbmQgKGhheXN0YWNrLCBuZWVkbGUpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBoYXlzdGFjay5sZW5ndGg7ICsraSkge1xuICAgIGlmIChoYXlzdGFja1tpXSA9PT0gbmVlZGxlKSB7XG4gICAgICByZXR1cm4gaVxuICAgIH1cbiAgfVxuICByZXR1cm4gLTFcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3cmFwUkVHTCAoYXJncykge1xuICB2YXIgY29uZmlnID0gaW5pdFdlYkdMKGFyZ3MpXG4gIGlmICghY29uZmlnKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHZhciBnbCA9IGNvbmZpZy5nbFxuICB2YXIgZ2xBdHRyaWJ1dGVzID0gZ2wuZ2V0Q29udGV4dEF0dHJpYnV0ZXMoKVxuICB2YXIgY29udGV4dExvc3QgPSBnbC5pc0NvbnRleHRMb3N0KClcblxuICB2YXIgZXh0ZW5zaW9uU3RhdGUgPSB3cmFwRXh0ZW5zaW9ucyhnbCwgY29uZmlnKVxuICBpZiAoIWV4dGVuc2lvblN0YXRlKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHZhciBzdHJpbmdTdG9yZSA9IGNyZWF0ZVN0cmluZ1N0b3JlKClcbiAgdmFyIHN0YXRzID0gY3JlYXRlU3RhdHMoKVxuICB2YXIgZXh0ZW5zaW9ucyA9IGV4dGVuc2lvblN0YXRlLmV4dGVuc2lvbnNcbiAgdmFyIHRpbWVyID0gY3JlYXRlVGltZXIoZ2wsIGV4dGVuc2lvbnMpXG5cbiAgdmFyIFNUQVJUX1RJTUUgPSBjbG9jaygpXG4gIHZhciBXSURUSCA9IGdsLmRyYXdpbmdCdWZmZXJXaWR0aFxuICB2YXIgSEVJR0hUID0gZ2wuZHJhd2luZ0J1ZmZlckhlaWdodFxuXG4gIHZhciBjb250ZXh0U3RhdGUgPSB7XG4gICAgdGljazogMCxcbiAgICB0aW1lOiAwLFxuICAgIHZpZXdwb3J0V2lkdGg6IFdJRFRILFxuICAgIHZpZXdwb3J0SGVpZ2h0OiBIRUlHSFQsXG4gICAgZnJhbWVidWZmZXJXaWR0aDogV0lEVEgsXG4gICAgZnJhbWVidWZmZXJIZWlnaHQ6IEhFSUdIVCxcbiAgICBkcmF3aW5nQnVmZmVyV2lkdGg6IFdJRFRILFxuICAgIGRyYXdpbmdCdWZmZXJIZWlnaHQ6IEhFSUdIVCxcbiAgICBwaXhlbFJhdGlvOiBjb25maWcucGl4ZWxSYXRpb1xuICB9XG4gIHZhciB1bmlmb3JtU3RhdGUgPSB7fVxuICB2YXIgZHJhd1N0YXRlID0ge1xuICAgIGVsZW1lbnRzOiBudWxsLFxuICAgIHByaW1pdGl2ZTogNCwgLy8gR0xfVFJJQU5HTEVTXG4gICAgY291bnQ6IC0xLFxuICAgIG9mZnNldDogMCxcbiAgICBpbnN0YW5jZXM6IC0xXG4gIH1cblxuICB2YXIgbGltaXRzID0gd3JhcExpbWl0cyhnbCwgZXh0ZW5zaW9ucylcbiAgdmFyIGJ1ZmZlclN0YXRlID0gd3JhcEJ1ZmZlcnMoZ2wsIHN0YXRzLCBjb25maWcpXG4gIHZhciBlbGVtZW50U3RhdGUgPSB3cmFwRWxlbWVudHMoZ2wsIGV4dGVuc2lvbnMsIGJ1ZmZlclN0YXRlLCBzdGF0cylcbiAgdmFyIGF0dHJpYnV0ZVN0YXRlID0gd3JhcEF0dHJpYnV0ZXMoXG4gICAgZ2wsXG4gICAgZXh0ZW5zaW9ucyxcbiAgICBsaW1pdHMsXG4gICAgYnVmZmVyU3RhdGUsXG4gICAgc3RyaW5nU3RvcmUpXG4gIHZhciBzaGFkZXJTdGF0ZSA9IHdyYXBTaGFkZXJzKGdsLCBzdHJpbmdTdG9yZSwgc3RhdHMsIGNvbmZpZylcbiAgdmFyIHRleHR1cmVTdGF0ZSA9IHdyYXBUZXh0dXJlcyhcbiAgICBnbCxcbiAgICBleHRlbnNpb25zLFxuICAgIGxpbWl0cyxcbiAgICBmdW5jdGlvbiAoKSB7IGNvcmUucHJvY3MucG9sbCgpIH0sXG4gICAgY29udGV4dFN0YXRlLFxuICAgIHN0YXRzLFxuICAgIGNvbmZpZylcbiAgdmFyIHJlbmRlcmJ1ZmZlclN0YXRlID0gd3JhcFJlbmRlcmJ1ZmZlcnMoZ2wsIGV4dGVuc2lvbnMsIGxpbWl0cywgc3RhdHMsIGNvbmZpZylcbiAgdmFyIGZyYW1lYnVmZmVyU3RhdGUgPSB3cmFwRnJhbWVidWZmZXJzKFxuICAgIGdsLFxuICAgIGV4dGVuc2lvbnMsXG4gICAgbGltaXRzLFxuICAgIHRleHR1cmVTdGF0ZSxcbiAgICByZW5kZXJidWZmZXJTdGF0ZSxcbiAgICBzdGF0cylcbiAgdmFyIGNvcmUgPSBjcmVhdGVDb3JlKFxuICAgIGdsLFxuICAgIHN0cmluZ1N0b3JlLFxuICAgIGV4dGVuc2lvbnMsXG4gICAgbGltaXRzLFxuICAgIGJ1ZmZlclN0YXRlLFxuICAgIGVsZW1lbnRTdGF0ZSxcbiAgICB0ZXh0dXJlU3RhdGUsXG4gICAgZnJhbWVidWZmZXJTdGF0ZSxcbiAgICB1bmlmb3JtU3RhdGUsXG4gICAgYXR0cmlidXRlU3RhdGUsXG4gICAgc2hhZGVyU3RhdGUsXG4gICAgZHJhd1N0YXRlLFxuICAgIGNvbnRleHRTdGF0ZSxcbiAgICB0aW1lcixcbiAgICBjb25maWcpXG4gIHZhciByZWFkUGl4ZWxzID0gd3JhcFJlYWQoXG4gICAgZ2wsXG4gICAgZnJhbWVidWZmZXJTdGF0ZSxcbiAgICBjb3JlLnByb2NzLnBvbGwsXG4gICAgY29udGV4dFN0YXRlLFxuICAgIGdsQXR0cmlidXRlcywgZXh0ZW5zaW9ucylcblxuICB2YXIgbmV4dFN0YXRlID0gY29yZS5uZXh0XG4gIHZhciBjYW52YXMgPSBnbC5jYW52YXNcblxuICB2YXIgcmFmQ2FsbGJhY2tzID0gW11cbiAgdmFyIGxvc3NDYWxsYmFja3MgPSBbXVxuICB2YXIgcmVzdG9yZUNhbGxiYWNrcyA9IFtdXG4gIHZhciBkZXN0cm95Q2FsbGJhY2tzID0gW2NvbmZpZy5vbkRlc3Ryb3ldXG5cbiAgdmFyIGFjdGl2ZVJBRiA9IG51bGxcbiAgZnVuY3Rpb24gaGFuZGxlUkFGICgpIHtcbiAgICBpZiAocmFmQ2FsbGJhY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgIHRpbWVyLnVwZGF0ZSgpXG4gICAgICB9XG4gICAgICBhY3RpdmVSQUYgPSBudWxsXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBzY2hlZHVsZSBuZXh0IGFuaW1hdGlvbiBmcmFtZVxuICAgIGFjdGl2ZVJBRiA9IHJhZi5uZXh0KGhhbmRsZVJBRilcblxuICAgIC8vIHBvbGwgZm9yIGNoYW5nZXNcbiAgICBwb2xsKClcblxuICAgIC8vIGZpcmUgYSBjYWxsYmFjayBmb3IgYWxsIHBlbmRpbmcgcmFmc1xuICAgIGZvciAodmFyIGkgPSByYWZDYWxsYmFja3MubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHZhciBjYiA9IHJhZkNhbGxiYWNrc1tpXVxuICAgICAgaWYgKGNiKSB7XG4gICAgICAgIGNiKGNvbnRleHRTdGF0ZSwgbnVsbCwgMClcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmbHVzaCBhbGwgcGVuZGluZyB3ZWJnbCBjYWxsc1xuICAgIGdsLmZsdXNoKClcblxuICAgIC8vIHBvbGwgR1BVIHRpbWVycyAqYWZ0ZXIqIGdsLmZsdXNoIHNvIHdlIGRvbid0IGRlbGF5IGNvbW1hbmQgZGlzcGF0Y2hcbiAgICBpZiAodGltZXIpIHtcbiAgICAgIHRpbWVyLnVwZGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRSQUYgKCkge1xuICAgIGlmICghYWN0aXZlUkFGICYmIHJhZkNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICBhY3RpdmVSQUYgPSByYWYubmV4dChoYW5kbGVSQUYpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RvcFJBRiAoKSB7XG4gICAgaWYgKGFjdGl2ZVJBRikge1xuICAgICAgcmFmLmNhbmNlbChoYW5kbGVSQUYpXG4gICAgICBhY3RpdmVSQUYgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlQ29udGV4dExvc3MgKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgLy8gc2V0IGNvbnRleHQgbG9zdCBmbGFnXG4gICAgY29udGV4dExvc3QgPSB0cnVlXG5cbiAgICAvLyBwYXVzZSByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZVxuICAgIHN0b3BSQUYoKVxuXG4gICAgLy8gbG9zZSBjb250ZXh0XG4gICAgbG9zc0NhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uIChjYikge1xuICAgICAgY2IoKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVDb250ZXh0UmVzdG9yZWQgKGV2ZW50KSB7XG4gICAgLy8gY2xlYXIgZXJyb3IgY29kZVxuICAgIGdsLmdldEVycm9yKClcblxuICAgIC8vIGNsZWFyIGNvbnRleHQgbG9zdCBmbGFnXG4gICAgY29udGV4dExvc3QgPSBmYWxzZVxuXG4gICAgLy8gcmVmcmVzaCBzdGF0ZVxuICAgIGV4dGVuc2lvblN0YXRlLnJlc3RvcmUoKVxuICAgIHNoYWRlclN0YXRlLnJlc3RvcmUoKVxuICAgIGJ1ZmZlclN0YXRlLnJlc3RvcmUoKVxuICAgIHRleHR1cmVTdGF0ZS5yZXN0b3JlKClcbiAgICByZW5kZXJidWZmZXJTdGF0ZS5yZXN0b3JlKClcbiAgICBmcmFtZWJ1ZmZlclN0YXRlLnJlc3RvcmUoKVxuICAgIGlmICh0aW1lcikge1xuICAgICAgdGltZXIucmVzdG9yZSgpXG4gICAgfVxuXG4gICAgLy8gcmVmcmVzaCBzdGF0ZVxuICAgIGNvcmUucHJvY3MucmVmcmVzaCgpXG5cbiAgICAvLyByZXN0YXJ0IFJBRlxuICAgIHN0YXJ0UkFGKClcblxuICAgIC8vIHJlc3RvcmUgY29udGV4dFxuICAgIHJlc3RvcmVDYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbiAoY2IpIHtcbiAgICAgIGNiKClcbiAgICB9KVxuICB9XG5cbiAgaWYgKGNhbnZhcykge1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKENPTlRFWFRfTE9TVF9FVkVOVCwgaGFuZGxlQ29udGV4dExvc3MsIGZhbHNlKVxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKENPTlRFWFRfUkVTVE9SRURfRVZFTlQsIGhhbmRsZUNvbnRleHRSZXN0b3JlZCwgZmFsc2UpXG4gIH1cblxuICBmdW5jdGlvbiBkZXN0cm95ICgpIHtcbiAgICByYWZDYWxsYmFja3MubGVuZ3RoID0gMFxuICAgIHN0b3BSQUYoKVxuXG4gICAgaWYgKGNhbnZhcykge1xuICAgICAgY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoQ09OVEVYVF9MT1NUX0VWRU5ULCBoYW5kbGVDb250ZXh0TG9zcylcbiAgICAgIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKENPTlRFWFRfUkVTVE9SRURfRVZFTlQsIGhhbmRsZUNvbnRleHRSZXN0b3JlZClcbiAgICB9XG5cbiAgICBzaGFkZXJTdGF0ZS5jbGVhcigpXG4gICAgZnJhbWVidWZmZXJTdGF0ZS5jbGVhcigpXG4gICAgcmVuZGVyYnVmZmVyU3RhdGUuY2xlYXIoKVxuICAgIHRleHR1cmVTdGF0ZS5jbGVhcigpXG4gICAgZWxlbWVudFN0YXRlLmNsZWFyKClcbiAgICBidWZmZXJTdGF0ZS5jbGVhcigpXG5cbiAgICBpZiAodGltZXIpIHtcbiAgICAgIHRpbWVyLmNsZWFyKClcbiAgICB9XG5cbiAgICBkZXN0cm95Q2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24gKGNiKSB7XG4gICAgICBjYigpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBpbGVQcm9jZWR1cmUgKG9wdGlvbnMpIHtcbiAgICBcbiAgICBcblxuICAgIGZ1bmN0aW9uIGZsYXR0ZW5OZXN0ZWRPcHRpb25zIChvcHRpb25zKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gZXh0ZW5kKHt9LCBvcHRpb25zKVxuICAgICAgZGVsZXRlIHJlc3VsdC51bmlmb3Jtc1xuICAgICAgZGVsZXRlIHJlc3VsdC5hdHRyaWJ1dGVzXG4gICAgICBkZWxldGUgcmVzdWx0LmNvbnRleHRcblxuICAgICAgaWYgKCdzdGVuY2lsJyBpbiByZXN1bHQgJiYgcmVzdWx0LnN0ZW5jaWwub3ApIHtcbiAgICAgICAgcmVzdWx0LnN0ZW5jaWwub3BCYWNrID0gcmVzdWx0LnN0ZW5jaWwub3BGcm9udCA9IHJlc3VsdC5zdGVuY2lsLm9wXG4gICAgICAgIGRlbGV0ZSByZXN1bHQuc3RlbmNpbC5vcFxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBtZXJnZSAobmFtZSkge1xuICAgICAgICBpZiAobmFtZSBpbiByZXN1bHQpIHtcbiAgICAgICAgICB2YXIgY2hpbGQgPSByZXN1bHRbbmFtZV1cbiAgICAgICAgICBkZWxldGUgcmVzdWx0W25hbWVdXG4gICAgICAgICAgT2JqZWN0LmtleXMoY2hpbGQpLmZvckVhY2goZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgICAgICAgIHJlc3VsdFtuYW1lICsgJy4nICsgcHJvcF0gPSBjaGlsZFtwcm9wXVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG1lcmdlKCdibGVuZCcpXG4gICAgICBtZXJnZSgnZGVwdGgnKVxuICAgICAgbWVyZ2UoJ2N1bGwnKVxuICAgICAgbWVyZ2UoJ3N0ZW5jaWwnKVxuICAgICAgbWVyZ2UoJ3BvbHlnb25PZmZzZXQnKVxuICAgICAgbWVyZ2UoJ3NjaXNzb3InKVxuICAgICAgbWVyZ2UoJ3NhbXBsZScpXG5cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXBhcmF0ZUR5bmFtaWMgKG9iamVjdCkge1xuICAgICAgdmFyIHN0YXRpY0l0ZW1zID0ge31cbiAgICAgIHZhciBkeW5hbWljSXRlbXMgPSB7fVxuICAgICAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICAgICAgdmFyIHZhbHVlID0gb2JqZWN0W29wdGlvbl1cbiAgICAgICAgaWYgKGR5bmFtaWMuaXNEeW5hbWljKHZhbHVlKSkge1xuICAgICAgICAgIGR5bmFtaWNJdGVtc1tvcHRpb25dID0gZHluYW1pYy51bmJveCh2YWx1ZSwgb3B0aW9uKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXRpY0l0ZW1zW29wdGlvbl0gPSB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZHluYW1pYzogZHluYW1pY0l0ZW1zLFxuICAgICAgICBzdGF0aWM6IHN0YXRpY0l0ZW1zXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVHJlYXQgY29udGV4dCB2YXJpYWJsZXMgc2VwYXJhdGUgZnJvbSBvdGhlciBkeW5hbWljIHZhcmlhYmxlc1xuICAgIHZhciBjb250ZXh0ID0gc2VwYXJhdGVEeW5hbWljKG9wdGlvbnMuY29udGV4dCB8fCB7fSlcbiAgICB2YXIgdW5pZm9ybXMgPSBzZXBhcmF0ZUR5bmFtaWMob3B0aW9ucy51bmlmb3JtcyB8fCB7fSlcbiAgICB2YXIgYXR0cmlidXRlcyA9IHNlcGFyYXRlRHluYW1pYyhvcHRpb25zLmF0dHJpYnV0ZXMgfHwge30pXG4gICAgdmFyIG9wdHMgPSBzZXBhcmF0ZUR5bmFtaWMoZmxhdHRlbk5lc3RlZE9wdGlvbnMob3B0aW9ucykpXG5cbiAgICB2YXIgc3RhdHMgPSB7XG4gICAgICBncHVUaW1lOiAwLjAsXG4gICAgICBjcHVUaW1lOiAwLjAsXG4gICAgICBjb3VudDogMFxuICAgIH1cblxuICAgIHZhciBjb21waWxlZCA9IGNvcmUuY29tcGlsZShvcHRzLCBhdHRyaWJ1dGVzLCB1bmlmb3JtcywgY29udGV4dCwgc3RhdHMpXG5cbiAgICB2YXIgZHJhdyA9IGNvbXBpbGVkLmRyYXdcbiAgICB2YXIgYmF0Y2ggPSBjb21waWxlZC5iYXRjaFxuICAgIHZhciBzY29wZSA9IGNvbXBpbGVkLnNjb3BlXG5cbiAgICAvLyBGSVhNRTogd2Ugc2hvdWxkIG1vZGlmeSBjb2RlIGdlbmVyYXRpb24gZm9yIGJhdGNoIGNvbW1hbmRzIHNvIHRoaXNcbiAgICAvLyBpc24ndCBuZWNlc3NhcnlcbiAgICB2YXIgRU1QVFlfQVJSQVkgPSBbXVxuICAgIGZ1bmN0aW9uIHJlc2VydmUgKGNvdW50KSB7XG4gICAgICB3aGlsZSAoRU1QVFlfQVJSQVkubGVuZ3RoIDwgY291bnQpIHtcbiAgICAgICAgRU1QVFlfQVJSQVkucHVzaChudWxsKVxuICAgICAgfVxuICAgICAgcmV0dXJuIEVNUFRZX0FSUkFZXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gUkVHTENvbW1hbmQgKGFyZ3MsIGJvZHkpIHtcbiAgICAgIHZhciBpXG4gICAgICBpZiAoY29udGV4dExvc3QpIHtcbiAgICAgICAgXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGFyZ3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNjb3BlLmNhbGwodGhpcywgbnVsbCwgYXJncywgMClcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmdzID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhcmdzOyArK2kpIHtcbiAgICAgICAgICAgIHNjb3BlLmNhbGwodGhpcywgbnVsbCwgYm9keSwgaSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcmdzKSkge1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBzY29wZS5jYWxsKHRoaXMsIGFyZ3NbaV0sIGJvZHksIGkpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzY29wZS5jYWxsKHRoaXMsIGFyZ3MsIGJvZHksIDApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZ3MgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChhcmdzID4gMCkge1xuICAgICAgICAgIHJldHVybiBiYXRjaC5jYWxsKHRoaXMsIHJlc2VydmUoYXJncyB8IDApLCBhcmdzIHwgMClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFyZ3MpKSB7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiBiYXRjaC5jYWxsKHRoaXMsIGFyZ3MsIGFyZ3MubGVuZ3RoKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZHJhdy5jYWxsKHRoaXMsIGFyZ3MpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4dGVuZChSRUdMQ29tbWFuZCwge1xuICAgICAgc3RhdHM6IHN0YXRzXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyIChvcHRpb25zKSB7XG4gICAgXG5cbiAgICB2YXIgY2xlYXJGbGFncyA9IDBcbiAgICBjb3JlLnByb2NzLnBvbGwoKVxuXG4gICAgdmFyIGMgPSBvcHRpb25zLmNvbG9yXG4gICAgaWYgKGMpIHtcbiAgICAgIGdsLmNsZWFyQ29sb3IoK2NbMF0gfHwgMCwgK2NbMV0gfHwgMCwgK2NbMl0gfHwgMCwgK2NbM10gfHwgMClcbiAgICAgIGNsZWFyRmxhZ3MgfD0gR0xfQ09MT1JfQlVGRkVSX0JJVFxuICAgIH1cbiAgICBpZiAoJ2RlcHRoJyBpbiBvcHRpb25zKSB7XG4gICAgICBnbC5jbGVhckRlcHRoKCtvcHRpb25zLmRlcHRoKVxuICAgICAgY2xlYXJGbGFncyB8PSBHTF9ERVBUSF9CVUZGRVJfQklUXG4gICAgfVxuICAgIGlmICgnc3RlbmNpbCcgaW4gb3B0aW9ucykge1xuICAgICAgZ2wuY2xlYXJTdGVuY2lsKG9wdGlvbnMuc3RlbmNpbCB8IDApXG4gICAgICBjbGVhckZsYWdzIHw9IEdMX1NURU5DSUxfQlVGRkVSX0JJVFxuICAgIH1cblxuICAgIFxuICAgIGdsLmNsZWFyKGNsZWFyRmxhZ3MpXG4gIH1cblxuICBmdW5jdGlvbiBmcmFtZSAoY2IpIHtcbiAgICBcbiAgICByYWZDYWxsYmFja3MucHVzaChjYilcblxuICAgIGZ1bmN0aW9uIGNhbmNlbCAoKSB7XG4gICAgICAvLyBGSVhNRTogIHNob3VsZCB3ZSBjaGVjayBzb21ldGhpbmcgb3RoZXIgdGhhbiBlcXVhbHMgY2IgaGVyZT9cbiAgICAgIC8vIHdoYXQgaWYgYSB1c2VyIGNhbGxzIGZyYW1lIHR3aWNlIHdpdGggdGhlIHNhbWUgY2FsbGJhY2suLi5cbiAgICAgIC8vXG4gICAgICB2YXIgaSA9IGZpbmQocmFmQ2FsbGJhY2tzLCBjYilcbiAgICAgIFxuICAgICAgZnVuY3Rpb24gcGVuZGluZ0NhbmNlbCAoKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGZpbmQocmFmQ2FsbGJhY2tzLCBwZW5kaW5nQ2FuY2VsKVxuICAgICAgICByYWZDYWxsYmFja3NbaW5kZXhdID0gcmFmQ2FsbGJhY2tzW3JhZkNhbGxiYWNrcy5sZW5ndGggLSAxXVxuICAgICAgICByYWZDYWxsYmFja3MubGVuZ3RoIC09IDFcbiAgICAgICAgaWYgKHJhZkNhbGxiYWNrcy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgIHN0b3BSQUYoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByYWZDYWxsYmFja3NbaV0gPSBwZW5kaW5nQ2FuY2VsXG4gICAgfVxuXG4gICAgc3RhcnRSQUYoKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNhbmNlbDogY2FuY2VsXG4gICAgfVxuICB9XG5cbiAgLy8gcG9sbCB2aWV3cG9ydFxuICBmdW5jdGlvbiBwb2xsVmlld3BvcnQgKCkge1xuICAgIHZhciB2aWV3cG9ydCA9IG5leHRTdGF0ZS52aWV3cG9ydFxuICAgIHZhciBzY2lzc29yQm94ID0gbmV4dFN0YXRlLnNjaXNzb3JfYm94XG4gICAgdmlld3BvcnRbMF0gPSB2aWV3cG9ydFsxXSA9IHNjaXNzb3JCb3hbMF0gPSBzY2lzc29yQm94WzFdID0gMFxuICAgIGNvbnRleHRTdGF0ZS52aWV3cG9ydFdpZHRoID1cbiAgICAgIGNvbnRleHRTdGF0ZS5mcmFtZWJ1ZmZlcldpZHRoID1cbiAgICAgIGNvbnRleHRTdGF0ZS5kcmF3aW5nQnVmZmVyV2lkdGggPVxuICAgICAgdmlld3BvcnRbMl0gPVxuICAgICAgc2Npc3NvckJveFsyXSA9IGdsLmRyYXdpbmdCdWZmZXJXaWR0aFxuICAgIGNvbnRleHRTdGF0ZS52aWV3cG9ydEhlaWdodCA9XG4gICAgICBjb250ZXh0U3RhdGUuZnJhbWVidWZmZXJIZWlnaHQgPVxuICAgICAgY29udGV4dFN0YXRlLmRyYXdpbmdCdWZmZXJIZWlnaHQgPVxuICAgICAgdmlld3BvcnRbM10gPVxuICAgICAgc2Npc3NvckJveFszXSA9IGdsLmRyYXdpbmdCdWZmZXJIZWlnaHRcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvbGwgKCkge1xuICAgIGNvbnRleHRTdGF0ZS50aWNrICs9IDFcbiAgICBjb250ZXh0U3RhdGUudGltZSA9IG5vdygpXG4gICAgcG9sbFZpZXdwb3J0KClcbiAgICBjb3JlLnByb2NzLnBvbGwoKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVmcmVzaCAoKSB7XG4gICAgcG9sbFZpZXdwb3J0KClcbiAgICBjb3JlLnByb2NzLnJlZnJlc2goKVxuICAgIGlmICh0aW1lcikge1xuICAgICAgdGltZXIudXBkYXRlKClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3cgKCkge1xuICAgIHJldHVybiAoY2xvY2soKSAtIFNUQVJUX1RJTUUpIC8gMTAwMC4wXG4gIH1cblxuICByZWZyZXNoKClcblxuICBmdW5jdGlvbiBhZGRMaXN0ZW5lciAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgXG5cbiAgICB2YXIgY2FsbGJhY2tzXG4gICAgc3dpdGNoIChldmVudCkge1xuICAgICAgY2FzZSAnZnJhbWUnOlxuICAgICAgICByZXR1cm4gZnJhbWUoY2FsbGJhY2spXG4gICAgICBjYXNlICdsb3N0JzpcbiAgICAgICAgY2FsbGJhY2tzID0gbG9zc0NhbGxiYWNrc1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncmVzdG9yZSc6XG4gICAgICAgIGNhbGxiYWNrcyA9IHJlc3RvcmVDYWxsYmFja3NcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ2Rlc3Ryb3knOlxuICAgICAgICBjYWxsYmFja3MgPSBkZXN0cm95Q2FsbGJhY2tzXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBcbiAgICB9XG5cbiAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjaylcbiAgICByZXR1cm4ge1xuICAgICAgY2FuY2VsOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrc1tpXSA9PT0gY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrc1tpXSA9IGNhbGxiYWNrc1tjYWxsYmFja3MubGVuZ3RoIC0gMV1cbiAgICAgICAgICAgIGNhbGxiYWNrcy5wb3AoKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIHJlZ2wgPSBleHRlbmQoY29tcGlsZVByb2NlZHVyZSwge1xuICAgIC8vIENsZWFyIGN1cnJlbnQgRkJPXG4gICAgY2xlYXI6IGNsZWFyLFxuXG4gICAgLy8gU2hvcnQgY3V0cyBmb3IgZHluYW1pYyB2YXJpYWJsZXNcbiAgICBwcm9wOiBkeW5hbWljLmRlZmluZS5iaW5kKG51bGwsIERZTl9QUk9QKSxcbiAgICBjb250ZXh0OiBkeW5hbWljLmRlZmluZS5iaW5kKG51bGwsIERZTl9DT05URVhUKSxcbiAgICB0aGlzOiBkeW5hbWljLmRlZmluZS5iaW5kKG51bGwsIERZTl9TVEFURSksXG5cbiAgICAvLyBleGVjdXRlcyBhbiBlbXB0eSBkcmF3IGNvbW1hbmRcbiAgICBkcmF3OiBjb21waWxlUHJvY2VkdXJlKHt9KSxcblxuICAgIC8vIFJlc291cmNlc1xuICAgIGJ1ZmZlcjogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBidWZmZXJTdGF0ZS5jcmVhdGUob3B0aW9ucywgR0xfQVJSQVlfQlVGRkVSLCBmYWxzZSwgZmFsc2UpXG4gICAgfSxcbiAgICBlbGVtZW50czogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBlbGVtZW50U3RhdGUuY3JlYXRlKG9wdGlvbnMsIGZhbHNlKVxuICAgIH0sXG4gICAgdGV4dHVyZTogdGV4dHVyZVN0YXRlLmNyZWF0ZTJELFxuICAgIGN1YmU6IHRleHR1cmVTdGF0ZS5jcmVhdGVDdWJlLFxuICAgIHJlbmRlcmJ1ZmZlcjogcmVuZGVyYnVmZmVyU3RhdGUuY3JlYXRlLFxuICAgIGZyYW1lYnVmZmVyOiBmcmFtZWJ1ZmZlclN0YXRlLmNyZWF0ZSxcbiAgICBmcmFtZWJ1ZmZlckN1YmU6IGZyYW1lYnVmZmVyU3RhdGUuY3JlYXRlQ3ViZSxcblxuICAgIC8vIEV4cG9zZSBjb250ZXh0IGF0dHJpYnV0ZXNcbiAgICBhdHRyaWJ1dGVzOiBnbEF0dHJpYnV0ZXMsXG5cbiAgICAvLyBGcmFtZSByZW5kZXJpbmdcbiAgICBmcmFtZTogZnJhbWUsXG4gICAgb246IGFkZExpc3RlbmVyLFxuXG4gICAgLy8gU3lzdGVtIGxpbWl0c1xuICAgIGxpbWl0czogbGltaXRzLFxuICAgIGhhc0V4dGVuc2lvbjogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHJldHVybiBsaW1pdHMuZXh0ZW5zaW9ucy5pbmRleE9mKG5hbWUudG9Mb3dlckNhc2UoKSkgPj0gMFxuICAgIH0sXG5cbiAgICAvLyBSZWFkIHBpeGVsc1xuICAgIHJlYWQ6IHJlYWRQaXhlbHMsXG5cbiAgICAvLyBEZXN0cm95IHJlZ2wgYW5kIGFsbCBhc3NvY2lhdGVkIHJlc291cmNlc1xuICAgIGRlc3Ryb3k6IGRlc3Ryb3ksXG5cbiAgICAvLyBEaXJlY3QgR0wgc3RhdGUgbWFuaXB1bGF0aW9uXG4gICAgX2dsOiBnbCxcbiAgICBfcmVmcmVzaDogcmVmcmVzaCxcblxuICAgIHBvbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHBvbGwoKVxuICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgIHRpbWVyLnVwZGF0ZSgpXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEN1cnJlbnQgdGltZVxuICAgIG5vdzogbm93LFxuXG4gICAgLy8gcmVnbCBTdGF0aXN0aWNzIEluZm9ybWF0aW9uXG4gICAgc3RhdHM6IHN0YXRzXG4gIH0pXG5cbiAgY29uZmlnLm9uRG9uZShudWxsLCByZWdsKVxuXG4gIHJldHVybiByZWdsXG59XG4iXX0=
