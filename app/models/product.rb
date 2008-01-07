class Product < Post
  acts_as_ferret

def self.full_text_search(q, options = {})
   return nil if q.nil? or q==""
   default_options = {:limit => 10, :page => 1}
   options = default_options.merge options
 
   # get the offset based on what page we're on
   options[:offset] = options[:limit] * (options.delete(:page).to_i-1)
 
   # now do the query with our options
   results = Product.find_by_contents(q, options)
   return [results.total_hits, results]
end

def self.math_problem(atc)
  allcodes = Code.find_all_by_tc_atc_number(atc)
  alldins = Array.new
    for code in allcodes
      alldins << code.drug_code
    end
    
    vvsp = Hash.new
    for din in alldins
      if Product.find_by_din(din) != nil
            prod = Product.find_by_din(din)
            strength = ActiveIngredient.find_by_drug_code(din).strength
              for price in prod.prices
                vvsp[price.cost/strength.to_f] = price
              end 
      end
    end
 #newmin = 9999999
 #vvsp.each_key {|key| newmin = key if key < newmin }
 #return [vvsp[newmin], newmin]
 results = vvsp.sort
 return results
end
  
end