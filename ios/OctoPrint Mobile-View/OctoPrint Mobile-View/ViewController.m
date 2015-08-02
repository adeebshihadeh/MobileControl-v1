//
//  ViewController.m
//  OctoPrint Mobile-View
//
//  Created by quillford on 8/2/15.
//  Copyright (c) 2015 quillford. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    // load the page
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"https://quillford.github.io/MobileView-OctoPrint/"]]];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
