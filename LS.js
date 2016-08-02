var $, LScript;
(function () {
    var displayNone = "none",
        displayAuto = "",
        matchExpr = {
            "ID": /^#[\w]+/,
            "CLASS": /^[.][\w]+/,
            "TAG": /[*\w]/
        },
        lsCache = "ls" + 1 * new Date(),
        uid = 0,
        Type = {
            Object: "object", Numeric: "number", String: "string"
        },
        positiveInfinity = "+00", negativeInfinity = "-00",
        workerCount = 0;

    $ = LScript = function (selector) {
        return new LightScript(selector);
    }

    $.globalEval = function (script) {
        if (script) {
            script = script.trim();
            var Script = document.createElement("SCRIPT");
            Script.text = script;
            document.head.appendChild(Script).parentNode.removeChild(Script);
        }
    }

    $.each = function (collection, callBack) {
        if (collection.length) {
            var length = collection.length;
            for (var i = 0; i < length; i++) {
                var result = callBack.call(collection[i], i, collection[i]);
                if (result === false) {
                    break;
                }
            }
        }
        else if (typeof collection == Type.Object) {
            for (var key in collection) {
                var result = callBack.call(collection[key], key, collection[key]);
                if (result === false) {
                    break;
                }
            }
        }
    }

    var getScriptBlob = function (spawn, closeWorker) {
        return new Blob(["self.onmessage = function(e) { postMessage((" + spawn.toString() + ")(e.data));" + (closeWorker === true ? "close();}" : "}")], { type: "application/javascript" });
    }

    $.GetWorkerInstance = function (url) {
        if (window.Worker) {
            if (url) {
                return new Worker(url);
            }
            return new WorkerWrapper();
        }
        else {
            throw new Error("Web Worker API is not supported by your browser.")
        }
    }

    function WorkerWrapper() {
        this.worker = null;
        this.workerURL = null;
    }

    WorkerWrapper.prototype.do = function (fn, closeWorker) {
        this.worker = new Worker(this.workerURL = URL.createObjectURL(getScriptBlob(fn, closeWorker)));
    }

    WorkerWrapper.prototype.success = function (fn) {
        this.worker.onmessage = (function (f, u) {
            return function (e) {
                f(e.data);
                if (u) {
                    URL.revokeObjectURL(u);
                }
            }
        })(fn, this.workerURL);
    }

    WorkerWrapper.prototype.error = function (fn) {
        this.worker.onerror = (function (f, u) {
            return function (e) {
                f(e.message);
                if (u) {
                    URL.revokeObjectURL(u);
                }
            }
        })(fn, this.workerURL);
    }

    WorkerWrapper.prototype.run = function (data) {
        this.worker.postMessage(data);
    }

    WorkerWrapper.prototype.terminate = function () {
        this.worker.terminate();
    }

    $.Dictionary = function () { return new Dictionary(); }
    $.BinarySearchTree = function () { return new BinarySearchTree(); }
    $.AVLTree = function () { return new AVLTree(); }
    $.List = function () { return new List(); }
    $.SkipList = function () { return new SkipList(); }
    $.RedBlackTree = function () { return new RedBlackTree(); }

    var Find = {
        BSTree: function (key, root) {
            var currentNode = root;
            var parent = null;
            while (currentNode != null) {
                parent = currentNode;
                if (key === currentNode.key) {
                    return currentNode;
                }
                else if (key < currentNode.key) {
                    currentNode = currentNode.left;
                }
                else if (key > currentNode.key) {
                    currentNode = currentNode.right;
                }
            }
            return parent;
        },
        AVLTree: function (key, root) {
            var currentNode = root;
            var parent = null;
            while (currentNode != null) {
                parent = currentNode;
                if (key === currentNode.key) {
                    return currentNode;
                }
                else if (key < currentNode.key) {
                    currentNode = currentNode.left;
                }
                else if (key > currentNode.key) {
                    currentNode = currentNode.right;
                }
            }
            return parent;
        },
        List: function (key, head) {
            var node = head;
            if (node) {
                if (node.key === key) {
                    return node;
                }
                else {
                    while (node) {
                        node = node.next;
                        if (node && node.key === key) {
                            return node;
                        }
                    }
                    if (!node) {
                        return null;
                    }
                }
            }
            else {
                return null;
            }
        },
        SList: function (key, head) {
            var p = head;
            while (true) {
                while (p.right.key !== positiveInfinity && p.right.key <= key) {
                    p = p.right;
                }
                if (p.down) {
                    p = p.down;
                }
                else {
                    break;
                }
            }
            return p;
        },
        RBTree: function () {
            //To do.
        }
    }

    function Dictionary() {
        this.count = 0;
    }

    Dictionary.prototype.put = function (key, value) {
        if (!this[key]) {
            this.count++;
        }
        this[key] = value;
    }

    Dictionary.prototype.get = function (key) {
        return this[key];
    }

    Dictionary.prototype.remove = function (key) {
        if (this[key]) {
            this.count--;
            delete this[key];
        }
    }

    Dictionary.prototype.contains = function (key) {
        if (this.get(key)) {
            return true;
        }
        return false;
    }

    Dictionary.prototype.forEach = function (callBack) {
        $.each(this, callBack);
    }

    function BinarySearchTreeNode(key, value) {
        this.left = null;
        this.right = null;
        this.parent = null;
        this.key = key;
        this.value = value;
    }

    function BinarySearchTree() {
        this.root = null;
        this.Node = function (key, value) {
            return new BinarySearchTreeNode(key, value);
        }
    }

    BinarySearchTree.prototype.put = function (key, value) {
        if (this.root == null) {
            this.root = this.Node(key, value);
            return;
        }
        var node = Find.BSTree(key, this.root);
        if (node) {
            if (node.key === key) {
                node.value = value;
            }
            else if (key < node.key) {
                var newNode = this.Node(key, value);
                node.left = newNode;
                newNode.parent = node;
            }
            else if (key > node.key) {
                var newNode = this.Node(key, value);
                node.right = newNode;
                newNode.parent = node;
            }
        }
    }

    BinarySearchTree.prototype.get = function (key) {
        var node = Find.BSTree(key, this.root);
        if (node) {
            if (node.key === key) {
                return node.value;
            }
            return null;
        }
        return null;
    }

    BinarySearchTree.prototype.remove = function (key) {
        var node = Find.BSTree(key, this.root);
        if (node && node.key === key) {
            var parent = node.parent;
            if (!parent) {
                if (node.left == null && node.right == null) {
                    this.root = null;
                }
                else if (node.left && !node.right) {
                    node.left.parent = null;
                    this.root = node.left;
                }
                else if (node.right && !node.left) {
                    node.right.parent = null;
                    this.root = node.right;
                }
                else {
                    var successor = node.right;
                    while (successor.left != null) {
                        successor = successor.left;
                    }
                    node.key = successor.key;
                    node.value = successor.value;
                    var succParent = successor.parent;
                    succParent.left = successor.right;
                }
            }
            else {
                if (node.left == null && node.right == null) {
                    if (parent.left == node) {
                        parent.left = null;
                    }
                    else {
                        parent.right = null;
                    }
                }
                else if (node.left && !node.right) {
                    if (parent.left == node) {
                        parent.left = node.left;
                    }
                    else {
                        parent.right = node.left;
                    }
                }
                else if (node.right && !node.left) {
                    if (parent.left == node) {
                        parent.left = node.right;
                    }
                    else {
                        parent.right = node.right;
                    }
                }
                else {
                    var successor = node.right;
                    while (successor.left != null) {
                        successor = successor.left;
                    }
                    node.key = successor.key;
                    node.value = successor.value;
                    var succParent = successor.parent;
                    succParent.left = successor.right;
                }
            }
        }
    }

    BinarySearchTree.prototype.findMin = function () {
        if (this.root) {
            var node = this.root;
            var current = null;
            while (node) {
                current = node;
                node = node.left;
            }
            return current.value;
        }
    }

    BinarySearchTree.prototype.findMax = function () {
        if (this.root) {
            var node = this.root;
            var current = null;
            while (node) {
                current = node;
                node = node.right;
            }
            return current.value;
        }
    }

    BinarySearchTree.prototype.invertTree = function () {

    }

    function AVLTreeNode(key, value) {
        this.left = null;
        this.right = null;
        this.parent = null;
        this.height = null;
        this.key = key;
        this.value = value;
    }

    function AVLTree() {
        this.root = null;
        this.Node = function (key, value) {
            return new AVLTreeNode(key, value);
        }
    }

    AVLTree.prototype.put = function () {
        if (this.root == null) {
            this.root = this.Node(key, value);
            return;
        }
        var node = Find.AVLTree(key, this.root);
        if (node) {
            if (node.key === key) {
                node.value = value;
            }
            else if (key < node.key) {
                var newNode = this.Node(key, value);
                node.left = newNode;
                newNode.parent = node;
            }
            else if (key > node.key) {
                var newNode = this.Node(key, value);
                node.right = newNode;
                newNode.parent = node;
            }

            recompHeight(p);
        }
    }

    var tri_node_restructure = function (x, y, z) {
        var zIsLeftChild = (z == y.left),
           yIsLeftChild = (y == x.left);

        var a, b, c, T0, T1, T2, T3;

        if (zIsLeftChild && yIsLeftChild) {
            a = z;
            b = y;
            c = x;
            T0 = z.left;
            T1 = z.right;
            T2 = y.right;
            T3 = x.right;
        }
        else if (!zIsLeftChild && yIsLeftChild) {
            a = y;
            b = z;
            c = x;
            T0 = y.left;
            T1 = z.left;
            T2 = z.right;
            T3 = x.right;
        }
        else if (zIsLeftChild && !yIsLeftChild) {
            a = x;
            b = z;
            c = y;
            T0 = x.left;
            T1 = z.left;
            T2 = z.right;
            T3 = y.right;
        }
        else {
            a = x;
            b = y;
            c = z;
            T0 = x.left;
            T1 = y.left;
            T2 = z.left;
            T3 = z.right;
        }

        if (x == root) {
            root = b;
            b.parent = null;
        }
        else {
            var xParent;
            xParent = x.parent;
            if (x == xParent.left) {
                b.parent = xParent;
                xParent.left = b;
            }
            else {
                b.parent = xParent;
                xParent.right = b;
            }
        }

        b.left = a;
        a.parent = b;
        b.right = c;
        c.parent = b;

        a.left = T0;
        if (T0 != null) T0.parent = a;
        a.right = T1;
        if (T1 != null) T1.parent = a;

        c.left = T2;
        if (T2 != null) T2.parent = c;
        c.right = T3;
        if (T3 != null) T3.parent = c;

        recompHeight(a);
        recompHeight(c);

        return b;
    }


    var rebalance = function (p) {
        var x, y, z, q;
        while (p != null) {
            if (diffHeight(p.left, p.right) > 1) {
                x = p;
                y = tallerChild(x);
                z = tallerChild(y);
                p = tri_node_restructure(x, y, z);
            }
            p = p.parent;
        }
    }

    var tallerChild = function (p) {
        if (p.left == null)
            return p.right;
        if (p.right == null)
            return p.left;
        if (p.left.height > p.right.height)
            return p.left;
        else
            return p.right;
    }

    var diffHeight = function (t1, t2) {
        var h1, h2;
        if (t1 == null)
            h1 = 0;
        else
            h1 = t1.height;
        if (t2 == null)
            h2 = 0;
        else
            h2 = t2.height;
        return ((h1 >= h2) ? (h1 - h2) : (h2 - h1));
    }

    var maxHeight = function (t1, t2) {
        var h1, h2;
        if (t1 == null)
            h1 = 0;
        else
            h1 = t1.height;
        if (t2 == null)
            h2 = 0;
        else
            h2 = t2.height;
        return (h1 >= h2) ? h1 : h2;
    }

    var recompHeight = function (x) {
        while (x != null) {
            x.height = maxHeight(x.left, x.right) + 1;
            x = x.parent;
        }
    }

    AVLTree.prototype.get = function () {
        var node = Find.AVLTree(key, this.root);
        if (node) {
            if (node.key === key) {
                return node.value;
            }
            return null;
        }
        return null;
    }

    AVLTree.prototype.remove = function () {

    }

    AVLTree.prototype.findMin = function () {

    }

    AVLTree.prototype.findMax = function () {

    }

    function ListNode(key, value) {
        this.previous = null;
        this.next = null;
        this.key = key;
        this.value = value;
    }

    function List() {
        this.head = null;
        this.Node = function (key, value) {
            return new ListNode(key, value);
        }
    }

    List.prototype.put = function (key, value) {
        if (this.head == null) {
            this.head = this.Node(key, value);
            return;
        }
        var node = this.Node(key, value);
        node.next = this.head;
        this.head.previous = node;
        this.head = node;
    }

    List.prototype.get = function (key) {
        var node = Find.List(key, this.head);
        if (node) {
            return node.value;
        }
        return null;
    }

    List.prototype.remove = function (key) {
        var node = Find.List(key, this.head);
        if (node) {
            if (node.previous) {
                node.previous.next = node.next;
            }
            else {
                this.head = node.next;
            }
        }
    }

    List.prototype.findMin = function () {
        var min = this.head.value;
        var node = this.head;
        while (node) {
            node = node.next;
            if (node && node.value < min) {
                min = node.value;
            }
        }
        return min;
    }

    List.prototype.findMax = function () {
        var max = this.head.value;
        var node = this.head;
        while (node) {
            node = node.next;
            if (node && node.value > max) {
                max = node.value;
            }
        }
        return max;
    }

    function SkipListNode(key, value) {
        this.left = null;
        this.right = null;
        this.up = null;
        this.down = null;
        this.key = key;
        this.value = value;
    }

    function SkipList() {
        this.Node = function (key, value) {
            return new SkipListNode(key, value);
        }
        var h = this.Node(negativeInfinity, null);
        var t = this.Node(positiveInfinity, null);
        h.right = t;
        t.left = h;
        this.head = h;
        this.tail = t;
        this.h = 0;
    }

    SkipList.prototype.put = function (key, value) {
        var p = Find.SList(key, this.head);
        if (p.key === key) {
            p.value = value;
            return;
        }
        var q = this.Node(key, value);
        q.left = p;
        q.right = p.right;
        p.right.left = q;
        p.right = q;
        var i = 0;
        while (Math.random() < 0.5) {
            if (i >= this.h) {
                var h = this.Node(negativeInfinity, null);
                var t = this.Node(positiveInfinity, null);
                h.right = t;
                t.left = h;
                h.down = this.head;
                t.down = this.tail;
                this.head.up = h;
                this.tail.up = t;
                this.head = h;
                this.tail = t;
                this.h++;
            }
            while (p.up == null) {
                p = p.left;
            }
            p = p.up;
            var e = this.Node(key, null);
            e.left = p;
            e.right = p.right;
            p.right.left = e;
            p.right = e;
            e.down = q;
            q.up = e;
            q = e;
            i++;
        }
    }

    SkipList.prototype.get = function (key) {
        var p = Find.SList(key, this.head);
        if (p.key === key)
            return p.value;
        return null;
    }

    SkipList.prototype.remove = function (key) {
        var p = Find.SList(key, this.head);
        if (p.key === key) {
            while (p != null) {
                p.left.right = p.right;
                p.right.left = p.left;
                p = p.up;
            }
        }
    }

    SkipList.prototype.findMin = function () {
        var p = this.head;
        var current = null;
        while (p) {
            current = p;
            p = p.down;
        }
        return current.right.value;
    }

    SkipList.prototype.findMax = function () {
        var p = this.tail;
        var current = null;
        while (p) {
            current = p;
            p = p.down;
        }
        return current.left.value;
    }

    function RedBlackTreeNode(key, value) {
        this.left = null;
        this.right = null;
        this.parent = null;
        this.key = key;
        this.value = value;
    }

    function RedBlackTree() {

    }

    RedBlackTree.prototype.put = function () {

    }

    RedBlackTree.prototype.get = function () {

    }

    RedBlackTree.prototype.remove = function () {

    }

    RedBlackTree.prototype.findMin = function () {

    }

    RedBlackTree.prototype.findMax = function () {

    }

    function BloomFilters(setSize) {
	    this.setSize = setSize || 1000;
	    this.set = new Int8Array(this.setSize);
	}

	BloomFilters.prototype.add = function (value) {
	    var bitPositions = getBitPositions(value);
	    for (var i = 0; i < bitPositions.length; i++) {
	        this.set[bitPositions[i]] = 1;
	    }
	}

	BloomFilters.prototype.contains = function (value) {
	    var bitPositions = getBitPositions(value);
	    for (var i = 0; i < bitPositions.length; i++) {
	        if (this.set[bitPositions[i]] == 1) {
	            continue;
	        }
	        else {
	            return false;
	        }
	    }
	    return true;
	}

	function getBitPositions(value) {
	    var bin = "",
	        arrBitPos = [];
	    if (typeof value == "string") {
	        for (var i = 0; i < value.length; i++) {
	            bin += value[i].charCodeAt(0).toString(2);
	        }
	    }
	    else {
	        bin = (value >>> 0).toString(2);
	    }
	    arrBitPos.push(oddBits(bin));
	    arrBitPos.push(evenBits(bin));

	    return arrBitPos;
	}

	function oddBits(binBits) {
	    var oddbites = "";
	    for (var i = 1; i < binBits.length; i = i + 2) {
	        oddbites += binBits[i];
	    }
	    return parseInt(oddbites, 2) % this.setSize;
	}

	function evenBits(binBits) {
	    var evenbites = "";
	    for (var i = 0; i < binBits.length; i = i + 2) {
	        evenbites += binBits[i];
	    }
	    return parseInt(evenbites, 2) % this.setSize;
	}

    //******To do********.
    //  Queue
    //  Stack
    //  Priority Queues
    //  Heap
    //  Trie
    //  Treap
    //  ScapeGoat Tree
    //  Splay Tree
    //  Fusion Tree
    //  AA tree
    //  2–3 tree
    //  Graph

    //  Path finding
    //  Sorting
    //  Pattern matching

    $.fn = LScript.fn = LightScript.prototype;

    function LightScript(selector) {
        this.selector = selector || "";
        this.length = 0;
        if (selector) {
            if (typeof selector == Type.String) {
                selector = matchEngine(document, selector);
            }
            selector = selector.length ? selector : [selector];
            merge(selector, this);
        }
        !this.selector.length && delete this.selector;
        return this;
    }

    LightScript.prototype.css = function () {
        var length = this.length;
        if (arguments.length == 1) {
            if (typeof arguments[0] == Type.Object) {
                for (var prop in arguments[0]) {
                    for (var i = 0; i < length; i++) {
                        this[i].style[prop] = arguments[0][prop];
                    }
                }
            }
            else if (typeof arguments[0] == Type.String) {
                return this[0].style[arguments[0]];
            }
        }
        else {
            for (var i = 0; i < length; i++) {
                this[i].style[arguments[0]] = arguments[1];
            }
        }
        return this;
    }

    LightScript.prototype.addClass = function (name) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            this[i].classList.add(name);
        }
        return this;
    }

    LightScript.prototype.removeClass = function (name) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            this[i].classList.remove(name);
            if (this[i].classList.length == 0) {
                this[i].removeAttribute("class");
            }
        }
        return this;
    }

    LightScript.prototype.hasClass = function (name) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var classNames = this[i].classList;
            if (classNames && classNames.length > 0) {
                for (var j = 0; j < classNames.length; j++) {
                    if (classNames[j].indexOf(name) > -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    LightScript.prototype.show = function () {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            this[i].style.display = displayAuto;
        }
        return this;
    }

    LightScript.prototype.hide = function () {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            this[i].style.display = displayNone;
        }
        return this;
    }

    LightScript.prototype.parents = function () {
        var result = [];
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var elem = this[i];
            elem = elem.parentNode;
            while (elem) {
                result.push(elem);
                elem = elem.parentNode;
            }
        }
        return merge(result);
    }

    LightScript.prototype.find = function (selector) {
        var result = [];
        var length = this.length;
        for (var i = 0; i < length; i++) {
            if (this[i]) {
                var selection = matchEngine(this[i], selector);
                if (selection.length) {
                    for (var j = 0; j < selection.length; j++) {
                        result.push(selection[j]);
                    }
                }
                else {
                    result.push(selection);
                }
            }
        }
        return merge(result);
    }

    LightScript.prototype.children = function () {
        var result = [];
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var elem = this[i];
            var children = elem.childNodes;
            if (children) {
                for (var j = 0; j < children.length; j++) {
                    result.push(children[j]);
                }
            }
        }
        return merge(result);
    }

    LightScript.prototype.first = function () {
        var result = [];
        if (this[0]) {
            var elem = this[0];
            if (elem.parentNode) {
                elem = elem.parentNode;
                result.push(elem.firstElementChild);
            }
        }
        return merge(result);
    }

    LightScript.prototype.last = function () {
        var result = [];
        if (this[0]) {
            var elem = this[0];
            if (elem.parentNode) {
                elem = elem.parentNode;
                result.push(elem.lastElementChild);
            }
        }
        return merge(result);
    }

    LightScript.prototype.html = function (html) {
        if (html) {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                var elem = this[i];
                if (elem) { elem.innerHTML = html; }
            }
            return this;
        }
        else {
            if (this[0]) {
                return this[0].innerHTML;
            }
        }
    }

    LightScript.prototype.text = function (text) {
        if (text) {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                var elem = this[i];
                if (elem) { elem.textContent = text; }
            }
            return this;
        }
        else {
            if (this[0]) {
                return this[0].textContent || this[0].innerText;
            }
        }
    }

    LightScript.prototype.val = function (value) {
        if (value) {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                var elem = this[i];
                if (elem) { elem.value = value; }
            }
            return this;
        }
        else {
            if (this[0]) {
                return this[0].value;
            }
        }
    }

    LightScript.prototype.append = function (element) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var elem = this[i];
            if (elem) {
                if (elem.nodeName == "TABLE") {
                    elem = elem.getElementsByTagName("tbody")[0] || elem.appendChild(document.createElement("TBODY"));
                }
                if (typeof element == Type.String) {
                    elem.innerHTML += element;
                }
                else {
                    elem.appendChild(element);
                }
            }
        }
        return this;
    }

    LightScript.prototype.remove = function () {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var elem = this[i];
            if (elem && elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
        }
        this.length = 0;
        return this;
    }

    LightScript.prototype.empty = function () {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var elem = this[i];
            if (elem && elem.innerHTML) {
                elem.innerHTML = "";
            }
        }
        return this;
    }

    LightScript.prototype.attr = function (name) {
        var length = this.length;
        if (arguments.length == 1) {
            if (typeof name == Type.Object) {
                for (var prop in arguments[0]) {
                    for (var i = 0; i < length; i++) {
                        this[i].setAttribute(prop, arguments[0][prop]);
                    }
                }
            }
            else if (typeof name == Type.String) {
                return this[0].getAttribute(name);
            }
        }
        else {
            for (var i = 0; i < length; i++) {
                this[i].setAttribute(arguments[0], arguments[1]);
            }
        }
        return this;
    }

    LightScript.prototype.removeAttr = function (name) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            this[i].removeAttribute(arguments[0]);
        }
        return this;
    }

    LightScript.prototype.addOption = function () {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var elem = this[i];
            if (elem && elem.nodeName == "SELECT") {
                if (arguments.length == 1) {
                    var option = arguments[0];
                    if (option instanceof Array) {
                        for (var j = 0; j < option.length; j++) {
                            elem.options[elem.options.length] = new Option(option[j].text, option[j].value);
                        }
                    }
                    else if (typeof option == Type.Object) {
                        elem.options[elem.options.length] = new Option(option.text, option.value);
                    }
                }
                else {
                    elem.options[elem.options.length] = new Option(arguments[0], arguments[1]);
                }
            }
        }
        return this;
    }

    LightScript.prototype.deleteOption = function (value) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var elem = this[i];
            if (elem && elem.nodeName == "SELECT") {
                for (j = elem.length; j--;) {
                    if (elem.options[j].value == value)
                        elem.remove(j);
                }
            }
        }
        return this;
    }

    LightScript.prototype.clear = function () {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var elem = this[i];
            if (elem) {
                switch (elem.nodeName) {
                    case "SELECT":
                        elem.innerHTML = "";
                        break;
                    case "INPUT":
                        switch (elem.type) {
                            case "text":
                            case "hidden":
                            case "password":
                            case "radio":
                            case "checkbox":
                                elem.value = "";
                                if (elem.textContent) {
                                    elem.textContent = "";
                                }
                                break;
                        }
                        break;
                }
            }
        }
        return this;
    }

    LightScript.prototype.on = function (event, handler) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            if (this[i]) {
                var elem = this[i];
                eventCollection.put(elem, { Event: event, Handler: handler });
                elem.addEventListener(event, handler);
            }
        }
        return this;
    }

    LightScript.prototype.off = function (event, handler) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            var elem = this[i];
            if (handler) {
                elem.removeEventListener(event, handler);
            }
            else {
                var events = eventCollection.get(elem);
                for (var j = events.length; j--;) {
                    if (event ? events[j].Event == event : true) {
                        var Event = events[j].Event;
                        var Handler = events[j].Handler;
                        elem.removeEventListener(Event, Handler);
                        events.splice(j, 1);
                    }
                }
            }
        }
        return this;
    }

    LightScript.prototype.data = function (key, value) {
        if (value) {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                if (this[i]) {
                    cache.set(this[i], key, value);
                }
            }
            return this;
        }
        else {
            return cache.get(this[0], key);
        }
    }

    LightScript.prototype.removeData = function (key) {
        if (key) {
            var length = this.length;
            for (var i = 0; i < length; i++) {
                if (this[i]) {
                    cache.remove(this[i], key);
                }
            }
            return this;
        }
    }

    LightScript.prototype.each = function (callback) {
        $.each(this, callback);
    }

    function Cache() { }

    Cache.prototype.set = function (elem, key, value) {
        this.cache(this.key(elem))[key] = value;
    }

    Cache.prototype.get = function (elem, key) {
        return this.cache(this.key(elem))[key] ? this.cache(this.key(elem))[key] : null;
    }

    Cache.prototype.remove = function (elem, key) {
        this.cache(this.key(elem))[key] && delete this.cache(this.key(elem))[key];
    }

    Cache.prototype.cache = function (key) {
        return (this[key] || (this[key] = {}));
    }

    Cache.prototype.key = function (elem) {
        if (!elem[lsCache]) {
            elem[lsCache] = uid++;
            Object.defineProperty(elem, lsCache, { enumerable: false, writable: false, configurable: false });
        }
        return elem[lsCache];
    }

    function EventCollection() { }

    EventCollection.prototype.init = function (elem) {
        return (cache.cache(cache.key(elem)).eventCollection || (cache.cache(cache.key(elem)).eventCollection = []));
    }

    EventCollection.prototype.put = function (elem, eventObject) {
        this.init(elem).push(eventObject);
    }

    EventCollection.prototype.get = function (elem) {
        return this.init(elem);
    }

    var cache = new Cache();
    var eventCollection = new EventCollection();

    var matchEngine = function (context, selector) {
        for (var sel in matchExpr) {
            if (matchExpr[sel].test(selector)) {
                switch (sel) {
                    case "ID":
                        selector = selector.replace('#', '');
                        return document.getElementById(selector);
                    case "CLASS":
                        selector = selector.replace('.', '');
                        return document.getElementsByClassName(selector);
                    case "TAG":
                        return document.getElementsByTagName(selector);
                    default:
                        return context.querySelectorAll(selector);
                }
            }
        }
    }

    var merge = function (elems, LSobject) {
        if (elems.length > 1) {
            elems = removeDuplicates(elems);
        }
        var length = elems.length;
        LSobject = LSobject || new LightScript();
        for (var i = 0; i < length; i++) {
            LSobject[i] = elems[i];
            LSobject.length++;
        }
        return LSobject;
    }

    var removeDuplicates = function (elems) {
        var result = [];
        var length = elems.length;
        for (var i = 0; i < length; i++) {
            for (var j = i + 1; j < length; j++) {
                if (elems[i] === elems[j]) {
                    result.push(i);
                }
            }
        }
        if (result.length > 0) {
            for (var k = 0; k < result.length; k++) {
                elems.splice(result[k], 1);
            }
        }
        return elems;
    }
})();

// **************************************************************
// Charts. (standalone script, will integrate into LS if needed.)
// **************************************************************

var Chart = null;
(function () {
    function Ticks(values, n) {
        this.values = values;
        this.lowerBound = values.sort(function (a, b) {
            return a - b;
        })[0];
        this.upperBound = values.sort(function (a, b) {
            return a - b;
        })[values.length - 1];
        this.range = this.upperBound - this.lowerBound;
        this.roundedTickScale = Math.ceil(this.range / n);
        this.newLowerBound = this.roundedTickScale * Math.ceil(this.lowerBound / this.roundedTickScale);
        this.newUpperBound = this.roundedTickScale * Math.ceil(1 + this.upperBound / this.roundedTickScale);
        this.ticks = this.getTicks();
    }

    Ticks.prototype.getTicks = function () {
        var ticks = [];
        for (var i = this.newLowerBound; i <= this.newUpperBound; i = i + this.roundedTickScale) {
            ticks.push(i);
        }
        return ticks;
    }

    Chart = function (container, data, options) {
        this.container = container;
        this.data = data;
        this.labels = data.labels;
        this.values = data.values;
        this.chartType = options.type;
        this.canvas = document.createElement("canvas");
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.context = this.canvas.getContext('2d');
    }

    Chart.prototype.render = function () {
        this.container.appendChild(this.canvas);
        var context = this.context;
        context.beginPath();

        var Tick = {
            fromX: 0,
            fromY: 0,
            toX: 0,
            toY: 0,
            draw: function () {
                context.moveTo(fromX, fromY);
                context.lineTo(toX, toY);
            }
        };

        var Bar = {
            x: 0,
            y: 0,
            h: 0,
            w: 0,
            draw: function () {
                context.strokeRect(x, y, h, w);
                context.strokeStyle = "black";
                context.fillStyle = "#f7c7c9";
                context.fillRect(x, y, h, w);
            }
        };

        var Label = {
            x: 0,
            y: 0,
            text: "",
            draw: function () {

            }
        };

        Tick.draw();
        //context.moveTo(50, 50);
        //context.lineTo(50, 400);
        //context.lineTo(500, 400);

        //context.moveTo(50, 50);
        //context.lineTo(45, 50);

        //context.fillStyle = 'black';
        //context.font = "10px serif";
        //context.fillText("350", 20, 50);

        //context.moveTo(50, 150);
        //context.lineTo(45, 150);

        //context.fillStyle = 'black';
        //context.font = "10px serif";
        //context.fillText("250", 20, 150);

        //context.moveTo(50, 250);
        //context.lineTo(45, 250);

        //context.fillStyle = 'black';
        //context.font = "10px serif";
        //context.fillText("150", 20, 250);

        //context.moveTo(50, 350);
        //context.lineTo(45, 350);

        //context.fillStyle = 'black';
        //context.font = "10px serif";
        //context.fillText("50", 20, 350);

        //context.strokeRect(100, 300, 100, 100);
        //context.strokeStyle = "black";
        //context.fillStyle = "#f7c7c9";
        //context.fillRect(100, 300, 100, 100);

        //context.fillStyle = 'black';
        //context.font = "10px serif";
        //context.fillText("Jan", 105, 420);

        //context.strokeRect(250, 200, 100, 200);
        //context.strokeStyle = "black";
        //context.fillStyle = "#f7c7c9";
        //context.fillRect(250, 200, 100, 200);

        //context.fillStyle = 'black';
        //context.font = "10px serif";
        //context.fillText("Feb", 255, 420);

        //context.strokeRect(400, 100, 100, 300);
        //context.strokeStyle = "black";
        //context.fillStyle = "#f7c7c9";
        //context.fillRect(400, 100, 100, 300);

        //context.fillStyle = 'black';
        //context.font = "10px serif";
        //context.fillText("Mar", 405, 420);

        context.lineWidth = 0.5;
        context.stroke();
    }

    Chart.prototype.update = function () {

    }

    Chart.prototype.destroy = function () {

    }
})();