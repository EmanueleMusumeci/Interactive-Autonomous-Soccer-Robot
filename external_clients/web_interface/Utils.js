function print(m)
{
    console.log(m)
}

class Utils {

    static globalAxes = [[1,0,0],[0,1,0],[0,0,1]];

    static assert(condition, message) {
        if (!condition) {
            throw new Error(message || "Assertion failed");
        }
    }

    static append(list1, list2){
        var list = list1;
        for(let el of list2){
            list.push(el);
        }
        return list;
    }
    
    static identity2() {
        return [1,0,
                0,1];
    }

    /*
    static origin() {
        return vec3(0.0,0.0,0.0);
    }
    */

    static radians(angle) {
        return angle * Math.PI/180.0;
    }

    static repeatArray(times,array) {
        /*
        Generates a new array by repeating a given array a certain number
        of times
        */
        var result=[];
        for(var i=0; i<times; i+=1)
        {
            result = Utils.append(result,array)
        }
        return result;
    }

    static arrayFromElement(times,element)
    {
        /*
        Generates a new array by repeating a given element a certain number
        of times
        */
        var result=[];
        for(var i=0;i<times; i+=1)
        {
            result.push(element);
        }
        return result;
    }

    static mapValue(value, output_range_start, output_range_end, input_range_start, input_range_end)
    {        
        /*
        Maps the value from the input range to the output range
        */
        return output_range_start + ((output_range_end - output_range_start) / (input_range_end - input_range_start)) * (value - input_range_start);
    }

    static generateRandomColor()
    {
        return "#" + Math.floor(Math.random()*16777215).toString(16)
    }

    static vec2distance(vec1,vec2)
    {
        return Math.sqrt(Math.pow(vec1[0]-vec2[0],2)+Math.pow(vec1[1]-vec2[1],2))
    }

    /*
    static vec2dot(vec1,vec2)
    {
        return vec3(vec1[0]*vec2[0],vec1[1]*vec2[1])
    }
    

    static vec2acos(vec)
    {
        return vec3(Math.acos(vec[0]),Math.acos(vec[1]))
    }
    */

    static vec2equal(vec1,vec2){
        return vec1[0]==vec2[0] && vec1[1]==vec2[1]
    }
}

class Settings {
    /*
    Collects some general settings
    */
}