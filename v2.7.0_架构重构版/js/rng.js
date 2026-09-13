/* ===== v2.6: 种子随机数生成器 (Seedable RNG) =====
   同一 Seed + 相同调用顺序 = 相同结果
   用于保证人生核心事件的确定性，AI 文学描述仍可随机 */
(function(){
  var _seed = Date.now() & 0xffffffff;
  var _state = _seed >>> 0;

  /* Mulberry32 —— 短小快速，分布均匀 */
  function _mulberry32(a){
    return function(){
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var _rng = _mulberry32(_state);

  var RNG = {
    setSeed: function(seed){
      _seed = (seed || Date.now()) >>> 0;
      _state = _seed;
      _rng = _mulberry32(_state);
    },
    getSeed: function(){ return _seed; },
    /* 0~1 浮点 */
    rand: function(){ return _rng(); },
    /* min~max 整数（含两端） */
    int: function(min, max){
      return Math.floor(_rng() * (max - min + 1)) + min;
    },
    /* 从数组随机选一个 */
    pick: function(arr){
      if(!arr || !arr.length) return null;
      return arr[Math.floor(_rng() * arr.length)];
    },
    /* 按权重选：arr = [{item, weight}, ...] */
    weighted: function(arr){
      if(!arr || !arr.length) return null;
      var total = 0;
      for(var i=0;i<arr.length;i++){ total += (arr[i].weight || 1); }
      if(total <= 0) return arr[0].item;
      var r = _rng() * total;
      for(var j=0;j<arr.length;j++){
        r -= (arr[j].weight || 1);
        if(r <= 0) return arr[j].item;
      }
      return arr[arr.length-1].item;
    },
    /* 概率判定 p(0~1) */
    chance: function(p){ return _rng() < p; }
  };

  window.RNG = RNG;
})();
