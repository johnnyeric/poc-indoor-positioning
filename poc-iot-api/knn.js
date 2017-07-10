const _ = require('lodash');
const math = require('mathjs');

function getDim(a) {
    var dim = [];
    for (;;) {
        dim.push(a.length);

        if (Array.isArray(a[0])) {
            a = a[0];
        } else {
            break;
        }
    }
    return dim;
}

function std(matrix,mean){
    var rows = matrix.length;
    var cols = matrix[0].length;
    var result = [];
    for(var j = 0; j < cols; j++){
        result[j] = 0;
        for(var i = 0; i < rows; i++){
            result[j] += Math.pow(matrix[i][j] - mean[j],2);
        }
        result[j] = Math.sqrt(result[j]/(rows-1));
    }
    return result;
}

function sub(matrix,vec){
    var rows = matrix.length;
    var cols = matrix[0].length;
    //todo: check if column length of vector matches column length of matrix
    var result = [];
    for(var i = 0; i < rows; i++){
        result[i] = [];
        for(var j = 0; j < cols; j++){
            result[i][j] = matrix[i][j] - vec[j];
        }
    }
    return result;
}

function div(matrix,vec){
    var rows = matrix.length;
    var cols = matrix[0].length;
    //todo: check if column length of vector matches column length of matrix
    var result = [];
    for(var i = 0; i < rows; i++){
        result[i] = [];
        for(var j = 0; j < cols; j++){
            if (vec[j] > 0)
                result[i][j] = matrix[i][j] / vec[j];
            else 
                result[i][j] = matrix[i][j];
            console.log(typeof result[i][j], result[i][j])
        }
    }
    return result;
}

function normalize(matrix,mean,std){
    var m_norm = div(sub(matrix,mean),std);
    return m_norm;
}

function dist(matrix,x){
    //both need to have same column size
    var rows = matrix.length;
    var cols = matrix[0].length;

    var result = [];
    for(var i = 0; i < rows; i++){
        result[i] = 0;
        for(var j = 0; j < cols; j++){
            result[i] += Math.pow(matrix[i][j] - x[0][j],2);
        }
        result[i] = Math.sqrt(result[i]);
    }
    return result;
}

function sortKeepIndex(array){
    var len = array.length;
    var indexes = [];
    for(var i = 0; i<len; i++){indexes[i] = i}
    indexes.sort((a,b) => array[a] < array[b] ? -1 : array[a] > array[b] ? 1 : 0);
    return indexes;
}

function knn(matrix,x){
    console.log(matrix);
    
    //normalizar antes
    var mean = math.mean(matrix,0);
    console.log('mean: ' + mean);

    //
    var si = std(matrix,mean);
    console.log('sample std: '+ si);

    // normalization
    var matrix_norm = normalize(matrix,mean,si);
    console.log('matrix_norm: '+matrix_norm);

    //normalize x
    var x_norm = normalize(x,mean,si);
    console.log('x_norm: '+x_norm);

    //calc distances
    var distances = dist(matrix_norm,x_norm);
    console.log('dist: '+distances);

    //sorted indexes
    var indexes = sortKeepIndex(distances);
    console.log('indexes sorted: '+indexes);

    return {distances: distances, indexes:indexes};
}

module.exports = knn