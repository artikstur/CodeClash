using Core.Utils;

namespace Core.Models;

    public class TestCase: LongIdBase
    {
        public string Input { get; set; }
        
        public string Output { get; set; }
        
        public bool IsHidden { get; set; }
    }