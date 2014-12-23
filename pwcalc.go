package main

import (
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"os"
	"strings"

	"github.com/bgentry/speakeasy"
)

func main() {
	var alias string
	var length int
	fmt.Print("# enter alias: ")
	fmt.Scanf("%s", &alias)
	secret, err := speakeasy.Ask("# enter secret: ")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	fmt.Print("# enter length: ")
	fmt.Scanf("%d", &length)
	if length == 0 {
		length = 16
	}

	str := []byte(strings.TrimSpace(secret) + strings.TrimSpace(alias))
	hash := fmt.Sprintf("%s", sha1.Sum(str))
	base64 := base64.StdEncoding.EncodeToString([]byte(hash))[0:length]
	fmt.Printf("\n%s\n", base64)
}
