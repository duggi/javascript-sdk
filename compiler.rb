class Compiler < Thor
  require 'net/http'
  require 'uri'

  GoogleCompilerURL = "http://closure-compiler.appspot.com/compile"

  desc "compile", "Runs google closure compiler and generates minimized sdk"
  def compile

    params = {
      :js_code => master_file,
      :compilation_level => "SIMPLE_OPTIMIZATIONS",
      :output_format => "text",
      :output_info => "compiled_code"
    }

    res = Net::HTTP.post_form(URI.parse(GoogleCompilerURL), params)

    if(res["serverErrors"])
      puts "Server error occured"
      puts res
    else
      puts "JS File written successfully"
      File.open("groupit.min.js", 'w+') {|f| f.write(res.body)}
    end
  end


  
  desc "debug", "Writes the raw concat of the selected files out"
  def debug
    puts "JS File written successfully"
    File.open("groupit.min.js", 'w+') {|f| f.write(master_file)}
  end

  private

  #Load all source files
  def master_file
    wrapper = File.open("src/closureWrapper.js", 'rb') { |f| f.read }
    first_file = File.open("src/provide.js", 'rb') { |f| f.read }
    parts = wrapper.split("//INSERT_JAVASCRIPT_CODE_HERE")

    _master_file = parts[0]
    _master_file << first_file

    Dir["src/**/*.js"].each do |filename|
      next if filename.include? "closureWrapper.js"
      next if filename.include? "provide.js"
      puts filename
      _master_file << File.open(filename, 'rb') { |f| f.read }
    end
    
    _master_file << parts[1]
    return _master_file
  end
  
end