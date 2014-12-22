package main

import (
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"strings"
)

func main() {
	var alias, secret string

	fmt.Print("enter alias: ")
	fmt.Scanf("%s", &alias)
	fmt.Print("enter secret: ")
	fmt.Scanf("%s", &secret)

	str := []byte(strings.TrimSpace(secret) + strings.TrimSpace(alias))
	hash := fmt.Sprintf("%s", sha1.Sum(str))
    base64 := base64.StdEncoding.EncodeToString([]byte(hash))[0:16]

	fmt.Println(base64)
}
